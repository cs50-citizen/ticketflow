variable "aws_region" {
  description = "AWS deployment region (Sydney for AU market)"
  type        = string
  default     = "ap-southeast-2"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application identifier"
  type        = string
  default     = "ticketflow"
}

variable "db_password" {
  description = "PostgreSQL RDS Master Password"
  type        = string
  sensitive   = true
  default     = "ChangeMeStrongPassword2026!"
}
