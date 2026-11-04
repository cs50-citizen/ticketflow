package com.ticketflow.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketflow.common.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise Reliability: API Idempotency Filter
 * Prevents double-booking and duplicate payment submissions triggered by network retries or user double-clicking.
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

    public static final String IDEMPOTENCY_HEADER = "Idempotency-Key";
    private final ObjectMapper objectMapper;
    private final StringRedisTemplate stringRedisTemplate;

    // In-memory fallback for local dev when standalone Redis isn't running
    private final ConcurrentHashMap<String, Long> localKeyStore = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        // Target critical state-modifying payment & booking endpoints
        boolean isCriticalEndpoint = ("POST".equalsIgnoreCase(method) && uri.contains("/api/v1/orders"));

        if (isCriticalEndpoint) {
            String idempotencyKey = request.getHeader(IDEMPOTENCY_HEADER);

            if (StringUtils.hasText(idempotencyKey)) {
                boolean isLocked = tryAcquireLock("idemp:" + idempotencyKey, Duration.ofMinutes(2));
                if (!isLocked) {
                    log.warn("Idempotency violation: Duplicate request detected for key: {}", idempotencyKey);
                    response.setStatus(HttpStatus.CONFLICT.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(objectMapper.writeValueAsString(
                            ApiResponse.error("Duplicate request detected. Transaction already in progress for key: " + idempotencyKey)
                    ));
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean tryAcquireLock(String key, Duration ttl) {
        try {
            if (stringRedisTemplate != null && stringRedisTemplate.getConnectionFactory() != null) {
                Boolean success = stringRedisTemplate.opsForValue().setIfAbsent(key, "LOCKED", ttl);
                return Boolean.TRUE.equals(success);
            }
        } catch (Exception e) {
            // Graceful fallback to memory store if Redis is unavailable in local dev
        }

        long now = System.currentTimeMillis();
        Long existingExpire = localKeyStore.get(key);
        if (existingExpire != null && existingExpire > now) {
            return false; // key exists and still active
        }
        localKeyStore.put(key, now + ttl.toMillis());
        return true;
    }
}

