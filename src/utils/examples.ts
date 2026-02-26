export const EXAMPLE_GRAPH = `digraph G {
  rankdir = "RL";
  node [shape = rect, fontname = "sans-serif"];
  "data.aws_caller_identity.current" [label="data.aws_caller_identity.current"];
  "data.aws_eks_addon_version.this" [label="data.aws_eks_addon_version.this"];
  "data.aws_iam_policy_document.assume_role_policy" [label="data.aws_iam_policy_document.assume_role_policy"];
  "data.aws_iam_policy_document.cni_ipv6_policy" [label="data.aws_iam_policy_document.cni_ipv6_policy"];
  "data.aws_iam_policy_document.custom" [label="data.aws_iam_policy_document.custom"];
  "data.aws_iam_policy_document.node_assume_role_policy" [label="data.aws_iam_policy_document.node_assume_role_policy"];
  "data.aws_iam_session_context.current" [label="data.aws_iam_session_context.current"];
  "data.aws_partition.current" [label="data.aws_partition.current"];
  "data.tls_certificate.this" [label="data.tls_certificate.this"];
  "aws_cloudwatch_log_group.this" [label="aws_cloudwatch_log_group.this"];
  "aws_ec2_tag.cluster_primary_security_group" [label="aws_ec2_tag.cluster_primary_security_group"];
  "aws_eks_access_entry.this" [label="aws_eks_access_entry.this"];
  "aws_eks_access_policy_association.this" [label="aws_eks_access_policy_association.this"];
  "aws_eks_addon.before_compute" [label="aws_eks_addon.before_compute"];
  "aws_eks_addon.this" [label="aws_eks_addon.this"];
  "aws_eks_cluster.this" [label="aws_eks_cluster.this"];
  "aws_eks_identity_provider_config.this" [label="aws_eks_identity_provider_config.this"];
  "aws_iam_openid_connect_provider.oidc_provider" [label="aws_iam_openid_connect_provider.oidc_provider"];
  "aws_iam_policy.cluster_encryption" [label="aws_iam_policy.cluster_encryption"];
  "aws_iam_policy.cni_ipv6_policy" [label="aws_iam_policy.cni_ipv6_policy"];
  "aws_iam_policy.custom" [label="aws_iam_policy.custom"];
  "aws_iam_role.eks_auto" [label="aws_iam_role.eks_auto"];
  "aws_iam_role.this" [label="aws_iam_role.this"];
  "aws_iam_role_policy_attachment.additional" [label="aws_iam_role_policy_attachment.additional"];
  "aws_iam_role_policy_attachment.cluster_encryption" [label="aws_iam_role_policy_attachment.cluster_encryption"];
  "aws_iam_role_policy_attachment.custom" [label="aws_iam_role_policy_attachment.custom"];
  "aws_iam_role_policy_attachment.eks_auto" [label="aws_iam_role_policy_attachment.eks_auto"];
  "aws_iam_role_policy_attachment.eks_auto_additional" [label="aws_iam_role_policy_attachment.eks_auto_additional"];
  "aws_iam_role_policy_attachment.this" [label="aws_iam_role_policy_attachment.this"];
  "aws_security_group.cluster" [label="aws_security_group.cluster"];
  "aws_security_group.node" [label="aws_security_group.node"];
  "aws_security_group_rule.cluster" [label="aws_security_group_rule.cluster"];
  "aws_security_group_rule.node" [label="aws_security_group_rule.node"];
  "time_sleep.this" [label="time_sleep.this"];
  subgraph "cluster_module.eks_managed_node_group" {
    label = "module.eks_managed_node_group"
    fontname = "sans-serif"
    "module.eks_managed_node_group.data.aws_caller_identity.current" [label="data.aws_caller_identity.current"];
    "module.eks_managed_node_group.data.aws_ec2_instance_type.this" [label="data.aws_ec2_instance_type.this"];
    "module.eks_managed_node_group.data.aws_eks_cluster_versions.this" [label="data.aws_eks_cluster_versions.this"];
    "module.eks_managed_node_group.data.aws_iam_policy_document.assume_role_policy" [label="data.aws_iam_policy_document.assume_role_policy"];
    "module.eks_managed_node_group.data.aws_iam_policy_document.role" [label="data.aws_iam_policy_document.role"];
    "module.eks_managed_node_group.data.aws_partition.current" [label="data.aws_partition.current"];
    "module.eks_managed_node_group.data.aws_ssm_parameter.ami" [label="data.aws_ssm_parameter.ami"];
    "module.eks_managed_node_group.data.aws_subnet.this" [label="data.aws_subnet.this"];
    "module.eks_managed_node_group.aws_eks_node_group.this" [label="aws_eks_node_group.this"];
    "module.eks_managed_node_group.aws_iam_role.this" [label="aws_iam_role.this"];
    "module.eks_managed_node_group.aws_iam_role_policy.this" [label="aws_iam_role_policy.this"];
    "module.eks_managed_node_group.aws_iam_role_policy_attachment.additional" [label="aws_iam_role_policy_attachment.additional"];
    "module.eks_managed_node_group.aws_iam_role_policy_attachment.this" [label="aws_iam_role_policy_attachment.this"];
    "module.eks_managed_node_group.aws_launch_template.this" [label="aws_launch_template.this"];
    "module.eks_managed_node_group.aws_placement_group.this" [label="aws_placement_group.this"];
    "module.eks_managed_node_group.aws_security_group.this" [label="aws_security_group.this"];
    "module.eks_managed_node_group.aws_vpc_security_group_egress_rule.this" [label="aws_vpc_security_group_egress_rule.this"];
    "module.eks_managed_node_group.aws_vpc_security_group_ingress_rule.this" [label="aws_vpc_security_group_ingress_rule.this"];
  }
  subgraph "cluster_module.eks_managed_node_group.module.user_data" {
    label = "module.eks_managed_node_group.module.user_data"
    fontname = "sans-serif"
    "module.eks_managed_node_group.module.user_data.data.cloudinit_config.al2023_eks_managed_node_group" [label="data.cloudinit_config.al2023_eks_managed_node_group"];
    "module.eks_managed_node_group.module.user_data.data.cloudinit_config.al2_eks_managed_node_group" [label="data.cloudinit_config.al2_eks_managed_node_group"];
    "module.eks_managed_node_group.module.user_data.null_resource.validate_cluster_service_cidr" [label="null_resource.validate_cluster_service_cidr"];
  }
  subgraph "cluster_module.fargate_profile" {
    label = "module.fargate_profile"
    fontname = "sans-serif"
    "module.fargate_profile.data.aws_caller_identity.current" [label="data.aws_caller_identity.current"];
    "module.fargate_profile.data.aws_iam_policy_document.assume_role_policy" [label="data.aws_iam_policy_document.assume_role_policy"];
    "module.fargate_profile.data.aws_iam_policy_document.role" [label="data.aws_iam_policy_document.role"];
    "module.fargate_profile.data.aws_partition.current" [label="data.aws_partition.current"];
    "module.fargate_profile.data.aws_region.current" [label="data.aws_region.current"];
    "module.fargate_profile.aws_eks_fargate_profile.this" [label="aws_eks_fargate_profile.this"];
    "module.fargate_profile.aws_iam_role.this" [label="aws_iam_role.this"];
    "module.fargate_profile.aws_iam_role_policy.this" [label="aws_iam_role_policy.this"];
    "module.fargate_profile.aws_iam_role_policy_attachment.additional" [label="aws_iam_role_policy_attachment.additional"];
    "module.fargate_profile.aws_iam_role_policy_attachment.this" [label="aws_iam_role_policy_attachment.this"];
  }
  subgraph "cluster_module.kms" {
    label = "module.kms"
    fontname = "sans-serif"
    "module.kms.data.aws_caller_identity.current" [label="data.aws_caller_identity.current"];
    "module.kms.data.aws_iam_policy_document.this" [label="data.aws_iam_policy_document.this"];
    "module.kms.data.aws_partition.current" [label="data.aws_partition.current"];
    "module.kms.aws_kms_alias.this" [label="aws_kms_alias.this"];
    "module.kms.aws_kms_external_key.this" [label="aws_kms_external_key.this"];
    "module.kms.aws_kms_grant.this" [label="aws_kms_grant.this"];
    "module.kms.aws_kms_key.this" [label="aws_kms_key.this"];
    "module.kms.aws_kms_replica_external_key.this" [label="aws_kms_replica_external_key.this"];
    "module.kms.aws_kms_replica_key.this" [label="aws_kms_replica_key.this"];
  }
  subgraph "cluster_module.self_managed_node_group" {
    label = "module.self_managed_node_group"
    fontname = "sans-serif"
    "module.self_managed_node_group.data.aws_caller_identity.current" [label="data.aws_caller_identity.current"];
    "module.self_managed_node_group.data.aws_ec2_instance_type.this" [label="data.aws_ec2_instance_type.this"];
    "module.self_managed_node_group.data.aws_iam_policy_document.assume_role_policy" [label="data.aws_iam_policy_document.assume_role_policy"];
    "module.self_managed_node_group.data.aws_iam_policy_document.role" [label="data.aws_iam_policy_document.role"];
    "module.self_managed_node_group.data.aws_partition.current" [label="data.aws_partition.current"];
    "module.self_managed_node_group.data.aws_ssm_parameter.ami" [label="data.aws_ssm_parameter.ami"];
    "module.self_managed_node_group.data.aws_subnet.this" [label="data.aws_subnet.this"];
    "module.self_managed_node_group.aws_autoscaling_group.this" [label="aws_autoscaling_group.this"];
    "module.self_managed_node_group.aws_eks_access_entry.this" [label="aws_eks_access_entry.this"];
    "module.self_managed_node_group.aws_iam_instance_profile.this" [label="aws_iam_instance_profile.this"];
    "module.self_managed_node_group.aws_iam_role.this" [label="aws_iam_role.this"];
    "module.self_managed_node_group.aws_iam_role_policy.this" [label="aws_iam_role_policy.this"];
    "module.self_managed_node_group.aws_iam_role_policy_attachment.additional" [label="aws_iam_role_policy_attachment.additional"];
    "module.self_managed_node_group.aws_iam_role_policy_attachment.this" [label="aws_iam_role_policy_attachment.this"];
    "module.self_managed_node_group.aws_launch_template.this" [label="aws_launch_template.this"];
    "module.self_managed_node_group.aws_placement_group.this" [label="aws_placement_group.this"];
    "module.self_managed_node_group.aws_security_group.this" [label="aws_security_group.this"];
    "module.self_managed_node_group.aws_vpc_security_group_egress_rule.this" [label="aws_vpc_security_group_egress_rule.this"];
    "module.self_managed_node_group.aws_vpc_security_group_ingress_rule.this" [label="aws_vpc_security_group_ingress_rule.this"];
  }
  subgraph "cluster_module.self_managed_node_group.module.user_data" {
    label = "module.self_managed_node_group.module.user_data"
    fontname = "sans-serif"
    "module.self_managed_node_group.module.user_data.data.cloudinit_config.al2023_eks_managed_node_group" [label="data.cloudinit_config.al2023_eks_managed_node_group"];
    "module.self_managed_node_group.module.user_data.data.cloudinit_config.al2_eks_managed_node_group" [label="data.cloudinit_config.al2_eks_managed_node_group"];
    "module.self_managed_node_group.module.user_data.null_resource.validate_cluster_service_cidr" [label="null_resource.validate_cluster_service_cidr"];
  }
  "data.aws_eks_addon_version.this" -> "aws_eks_cluster.this";
  "data.aws_iam_policy_document.cni_ipv6_policy" -> "data.aws_partition.current";
  "data.aws_iam_policy_document.custom" -> "data.aws_partition.current";
  "data.aws_iam_session_context.current" -> "data.aws_caller_identity.current";
  "data.tls_certificate.this" -> "aws_eks_cluster.this";
  "aws_ec2_tag.cluster_primary_security_group" -> "aws_eks_cluster.this";
  "aws_eks_access_entry.this" -> "aws_eks_cluster.this";
  "aws_eks_access_policy_association.this" -> "aws_eks_access_entry.this";
  "aws_eks_addon.before_compute" -> "data.aws_eks_addon_version.this";
  "aws_eks_addon.this" -> "data.aws_eks_addon_version.this";
  "aws_eks_addon.this" -> "module.eks_managed_node_group.aws_eks_node_group.this";
  "aws_eks_addon.this" -> "module.eks_managed_node_group.aws_iam_role_policy.this";
  "aws_eks_addon.this" -> "module.eks_managed_node_group.aws_vpc_security_group_egress_rule.this";
  "aws_eks_addon.this" -> "module.eks_managed_node_group.aws_vpc_security_group_ingress_rule.this";
  "aws_eks_addon.this" -> "module.eks_managed_node_group.module.user_data.null_resource.validate_cluster_service_cidr";
  "aws_eks_addon.this" -> "module.fargate_profile.aws_eks_fargate_profile.this";
  "aws_eks_addon.this" -> "module.fargate_profile.aws_iam_role_policy.this";
  "aws_eks_addon.this" -> "module.fargate_profile.aws_iam_role_policy_attachment.additional";
  "aws_eks_addon.this" -> "module.fargate_profile.aws_iam_role_policy_attachment.this";
  "aws_eks_addon.this" -> "module.self_managed_node_group.aws_autoscaling_group.this";
  "aws_eks_addon.this" -> "module.self_managed_node_group.aws_eks_access_entry.this";
  "aws_eks_addon.this" -> "module.self_managed_node_group.aws_iam_role_policy.this";
  "aws_eks_addon.this" -> "module.self_managed_node_group.aws_vpc_security_group_egress_rule.this";
  "aws_eks_addon.this" -> "module.self_managed_node_group.aws_vpc_security_group_ingress_rule.this";
  "aws_eks_addon.this" -> "module.self_managed_node_group.module.user_data.null_resource.validate_cluster_service_cidr";
  "aws_eks_cluster.this" -> "aws_cloudwatch_log_group.this";
  "aws_eks_cluster.this" -> "aws_iam_policy.cni_ipv6_policy";
  "aws_eks_cluster.this" -> "aws_iam_role.eks_auto";
  "aws_eks_cluster.this" -> "aws_iam_role_policy_attachment.this";
  "aws_eks_cluster.this" -> "aws_security_group_rule.cluster";
  "aws_eks_cluster.this" -> "aws_security_group_rule.node";
  "aws_eks_cluster.this" -> "module.kms.aws_kms_external_key.this";
  "aws_eks_cluster.this" -> "module.kms.aws_kms_key.this";
  "aws_eks_cluster.this" -> "module.kms.aws_kms_replica_external_key.this";
  "aws_eks_cluster.this" -> "module.kms.aws_kms_replica_key.this";
  "aws_eks_identity_provider_config.this" -> "aws_eks_cluster.this";
  "aws_iam_openid_connect_provider.oidc_provider" -> "data.tls_certificate.this";
  "aws_iam_policy.cluster_encryption" -> "module.kms.aws_kms_external_key.this";
  "aws_iam_policy.cluster_encryption" -> "module.kms.aws_kms_key.this";
  "aws_iam_policy.cluster_encryption" -> "module.kms.aws_kms_replica_external_key.this";
  "aws_iam_policy.cluster_encryption" -> "module.kms.aws_kms_replica_key.this";
  "aws_iam_policy.cni_ipv6_policy" -> "data.aws_iam_policy_document.cni_ipv6_policy";
  "aws_iam_policy.custom" -> "data.aws_iam_policy_document.custom";
  "aws_iam_role.eks_auto" -> "data.aws_iam_policy_document.node_assume_role_policy";
  "aws_iam_role.this" -> "data.aws_iam_policy_document.assume_role_policy";
  "aws_iam_role_policy_attachment.additional" -> "aws_iam_role.this";
  "aws_iam_role_policy_attachment.cluster_encryption" -> "aws_iam_policy.cluster_encryption";
  "aws_iam_role_policy_attachment.custom" -> "aws_iam_policy.custom";
  "aws_iam_role_policy_attachment.custom" -> "aws_iam_role.this";
  "aws_iam_role_policy_attachment.eks_auto" -> "data.aws_partition.current";
  "aws_iam_role_policy_attachment.eks_auto" -> "aws_iam_role.eks_auto";
  "aws_iam_role_policy_attachment.eks_auto_additional" -> "aws_iam_role.eks_auto";
  "aws_iam_role_policy_attachment.this" -> "data.aws_partition.current";
  "aws_iam_role_policy_attachment.this" -> "aws_iam_role.this";
  "aws_security_group_rule.cluster" -> "aws_security_group.cluster";
  "aws_security_group_rule.cluster" -> "aws_security_group.node";
  "aws_security_group_rule.node" -> "aws_security_group.cluster";
  "aws_security_group_rule.node" -> "aws_security_group.node";
  "time_sleep.this" -> "aws_eks_cluster.this";
  "module.eks_managed_node_group.data.aws_caller_identity.current" -> "data.aws_caller_identity.current";
  "module.eks_managed_node_group.data.aws_eks_cluster_versions.this" -> "time_sleep.this";
  "module.eks_managed_node_group.data.aws_partition.current" -> "data.aws_partition.current";
  "module.eks_managed_node_group.data.aws_ssm_parameter.ami" -> "module.eks_managed_node_group.data.aws_eks_cluster_versions.this";
  "module.eks_managed_node_group.aws_eks_node_group.this" -> "module.eks_managed_node_group.data.aws_ssm_parameter.ami";
  "module.eks_managed_node_group.aws_eks_node_group.this" -> "module.eks_managed_node_group.aws_launch_template.this";
  "module.eks_managed_node_group.aws_iam_role.this" -> "module.eks_managed_node_group.data.aws_iam_policy_document.assume_role_policy";
  "module.eks_managed_node_group.aws_iam_role_policy.this" -> "module.eks_managed_node_group.data.aws_iam_policy_document.role";
  "module.eks_managed_node_group.aws_iam_role_policy.this" -> "module.eks_managed_node_group.aws_iam_role.this";
  "module.eks_managed_node_group.aws_iam_role_policy_attachment.additional" -> "module.eks_managed_node_group.aws_iam_role.this";
  "module.eks_managed_node_group.aws_iam_role_policy_attachment.this" -> "module.eks_managed_node_group.data.aws_caller_identity.current";
  "module.eks_managed_node_group.aws_iam_role_policy_attachment.this" -> "module.eks_managed_node_group.data.aws_partition.current";
  "module.eks_managed_node_group.aws_iam_role_policy_attachment.this" -> "module.eks_managed_node_group.aws_iam_role.this";
  "module.eks_managed_node_group.aws_launch_template.this" -> "module.eks_managed_node_group.data.aws_ec2_instance_type.this";
  "module.eks_managed_node_group.aws_launch_template.this" -> "module.eks_managed_node_group.aws_iam_role_policy_attachment.additional";
  "module.eks_managed_node_group.aws_launch_template.this" -> "module.eks_managed_node_group.aws_iam_role_policy_attachment.this";
  "module.eks_managed_node_group.aws_launch_template.this" -> "module.eks_managed_node_group.aws_placement_group.this";
  "module.eks_managed_node_group.aws_launch_template.this" -> "module.eks_managed_node_group.aws_security_group.this";
  "module.eks_managed_node_group.aws_launch_template.this" -> "module.eks_managed_node_group.module.user_data.data.cloudinit_config.al2023_eks_managed_node_group";
  "module.eks_managed_node_group.aws_launch_template.this" -> "module.eks_managed_node_group.module.user_data.data.cloudinit_config.al2_eks_managed_node_group";
  "module.eks_managed_node_group.aws_placement_group.this" -> "time_sleep.this";
  "module.eks_managed_node_group.aws_security_group.this" -> "time_sleep.this";
  "module.eks_managed_node_group.aws_security_group.this" -> "module.eks_managed_node_group.data.aws_subnet.this";
  "module.eks_managed_node_group.aws_vpc_security_group_egress_rule.this" -> "module.eks_managed_node_group.aws_security_group.this";
  "module.eks_managed_node_group.aws_vpc_security_group_ingress_rule.this" -> "module.eks_managed_node_group.aws_security_group.this";
  "module.eks_managed_node_group.module.user_data.data.cloudinit_config.al2023_eks_managed_node_group" -> "time_sleep.this";
  "module.eks_managed_node_group.module.user_data.null_resource.validate_cluster_service_cidr" -> "time_sleep.this";
  "module.fargate_profile.data.aws_caller_identity.current" -> "data.aws_caller_identity.current";
  "module.fargate_profile.data.aws_iam_policy_document.assume_role_policy" -> "time_sleep.this";
  "module.fargate_profile.data.aws_iam_policy_document.assume_role_policy" -> "module.fargate_profile.data.aws_caller_identity.current";
  "module.fargate_profile.data.aws_iam_policy_document.assume_role_policy" -> "module.fargate_profile.data.aws_partition.current";
  "module.fargate_profile.data.aws_iam_policy_document.assume_role_policy" -> "module.fargate_profile.data.aws_region.current";
  "module.fargate_profile.data.aws_partition.current" -> "data.aws_partition.current";
  "module.fargate_profile.aws_eks_fargate_profile.this" -> "module.fargate_profile.aws_iam_role.this";
  "module.fargate_profile.aws_iam_role.this" -> "module.fargate_profile.data.aws_iam_policy_document.assume_role_policy";
  "module.fargate_profile.aws_iam_role_policy.this" -> "module.fargate_profile.data.aws_iam_policy_document.role";
  "module.fargate_profile.aws_iam_role_policy.this" -> "module.fargate_profile.aws_iam_role.this";
  "module.fargate_profile.aws_iam_role_policy_attachment.additional" -> "module.fargate_profile.aws_iam_role.this";
  "module.fargate_profile.aws_iam_role_policy_attachment.this" -> "module.fargate_profile.aws_iam_role.this";
  "module.kms.data.aws_iam_policy_document.this" -> "data.aws_iam_session_context.current";
  "module.kms.data.aws_iam_policy_document.this" -> "aws_iam_role.this";
  "module.kms.data.aws_iam_policy_document.this" -> "module.kms.data.aws_caller_identity.current";
  "module.kms.data.aws_iam_policy_document.this" -> "module.kms.data.aws_partition.current";
  "module.kms.aws_kms_alias.this" -> "module.kms.aws_kms_external_key.this";
  "module.kms.aws_kms_alias.this" -> "module.kms.aws_kms_key.this";
  "module.kms.aws_kms_alias.this" -> "module.kms.aws_kms_replica_external_key.this";
  "module.kms.aws_kms_alias.this" -> "module.kms.aws_kms_replica_key.this";
  "module.kms.aws_kms_external_key.this" -> "module.kms.data.aws_iam_policy_document.this";
  "module.kms.aws_kms_grant.this" -> "module.kms.aws_kms_external_key.this";
  "module.kms.aws_kms_grant.this" -> "module.kms.aws_kms_key.this";
  "module.kms.aws_kms_grant.this" -> "module.kms.aws_kms_replica_external_key.this";
  "module.kms.aws_kms_grant.this" -> "module.kms.aws_kms_replica_key.this";
  "module.kms.aws_kms_key.this" -> "module.kms.data.aws_iam_policy_document.this";
  "module.kms.aws_kms_replica_external_key.this" -> "module.kms.data.aws_iam_policy_document.this";
  "module.kms.aws_kms_replica_key.this" -> "module.kms.data.aws_iam_policy_document.this";
  "module.self_managed_node_group.data.aws_caller_identity.current" -> "data.aws_caller_identity.current";
  "module.self_managed_node_group.data.aws_partition.current" -> "data.aws_partition.current";
  "module.self_managed_node_group.data.aws_ssm_parameter.ami" -> "time_sleep.this";
  "module.self_managed_node_group.aws_autoscaling_group.this" -> "module.self_managed_node_group.aws_launch_template.this";
  "module.self_managed_node_group.aws_eks_access_entry.this" -> "time_sleep.this";
  "module.self_managed_node_group.aws_eks_access_entry.this" -> "module.self_managed_node_group.aws_iam_role.this";
  "module.self_managed_node_group.aws_iam_instance_profile.this" -> "module.self_managed_node_group.aws_iam_role.this";
  "module.self_managed_node_group.aws_iam_role.this" -> "module.self_managed_node_group.data.aws_iam_policy_document.assume_role_policy";
  "module.self_managed_node_group.aws_iam_role_policy.this" -> "module.self_managed_node_group.data.aws_iam_policy_document.role";
  "module.self_managed_node_group.aws_iam_role_policy.this" -> "module.self_managed_node_group.aws_iam_role.this";
  "module.self_managed_node_group.aws_iam_role_policy_attachment.additional" -> "module.self_managed_node_group.aws_iam_role.this";
  "module.self_managed_node_group.aws_iam_role_policy_attachment.this" -> "module.self_managed_node_group.data.aws_caller_identity.current";
  "module.self_managed_node_group.aws_iam_role_policy_attachment.this" -> "module.self_managed_node_group.data.aws_partition.current";
  "module.self_managed_node_group.aws_iam_role_policy_attachment.this" -> "module.self_managed_node_group.aws_iam_role.this";
  "module.self_managed_node_group.aws_launch_template.this" -> "module.self_managed_node_group.data.aws_ec2_instance_type.this";
  "module.self_managed_node_group.aws_launch_template.this" -> "module.self_managed_node_group.data.aws_ssm_parameter.ami";
  "module.self_managed_node_group.aws_launch_template.this" -> "module.self_managed_node_group.aws_iam_instance_profile.this";
  "module.self_managed_node_group.aws_launch_template.this" -> "module.self_managed_node_group.aws_iam_role_policy_attachment.additional";
  "module.self_managed_node_group.aws_launch_template.this" -> "module.self_managed_node_group.aws_iam_role_policy_attachment.this";
  "module.self_managed_node_group.aws_launch_template.this" -> "module.self_managed_node_group.aws_placement_group.this";
  "module.self_managed_node_group.aws_launch_template.this" -> "module.self_managed_node_group.module.user_data.data.cloudinit_config.al2023_eks_managed_node_group";
  "module.self_managed_node_group.aws_launch_template.this" -> "module.self_managed_node_group.module.user_data.data.cloudinit_config.al2_eks_managed_node_group";
  "module.self_managed_node_group.aws_placement_group.this" -> "time_sleep.this";
  "module.self_managed_node_group.aws_security_group.this" -> "time_sleep.this";
  "module.self_managed_node_group.aws_security_group.this" -> "module.self_managed_node_group.data.aws_subnet.this";
  "module.self_managed_node_group.aws_vpc_security_group_egress_rule.this" -> "module.self_managed_node_group.aws_security_group.this";
  "module.self_managed_node_group.aws_vpc_security_group_ingress_rule.this" -> "module.self_managed_node_group.aws_security_group.this";
  "module.self_managed_node_group.module.user_data.data.cloudinit_config.al2023_eks_managed_node_group" -> "time_sleep.this";
  "module.self_managed_node_group.module.user_data.null_resource.validate_cluster_service_cidr" -> "time_sleep.this";
}`;

export const SIMPLE_EXAMPLE = `digraph Simple {
  A -> B;
  A -> C;
  B -> D;
  C -> D;
}`;

export const COMPLEX_EXAMPLE = `digraph Dependencies {
  rankdir=LR;
  
  node [shape=box, style="rounded,filled", fillcolor=white];
  
  App [fillcolor=lightgreen];
  
  App -> Router;
  App -> Store;
  App -> API;
  
  Router -> HomePage;
  Router -> ProfilePage;
  Router -> SettingsPage;
  
  HomePage -> UserList;
  HomePage -> Dashboard;
  
  ProfilePage -> UserProfile;
  ProfilePage -> UserSettings;
  
  UserList -> API;
  Dashboard -> API;
  UserProfile -> API;
  UserSettings -> Store;
  
  Store -> LocalStorage;
  API -> HTTPClient;
  
  HTTPClient [fillcolor=lightblue];
  LocalStorage [fillcolor=lightblue];
}`;
