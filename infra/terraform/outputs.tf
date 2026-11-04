output "alb_dns_name" {
  description = "Application Load Balancer DNS Endpoint"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "cloudfront_domain_name" {
  description = "CloudFront CDN URL for Frontend SPA"
  value       = aws_cloudfront_distribution.cdn.domain_name
}
