# Multi-Stage Production Dockerfile for TicketFlow Backend
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Cache dependencies
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B

# Build application
COPY src src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Security: Run as unprivileged non-root user
RUN addgroup -S ticketflow && adduser -S ticketflow -G ticketflow
USER ticketflow:ticketflow

# Copy artifact from builder
COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

# Production JVM tuning: container memory awareness & active GC
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]

