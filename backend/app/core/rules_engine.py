# Rules Engine Module
# NDPA 2023 Compliance Rules


from typing import List, Dict, Any
from dataclasses import dataclass
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class Finding:
    rule_id: str
    severity: Severity
    description: str
    recommendation: str


class ComplianceRulesEngine:
    """
    Rules engine for NDPA 2023 compliance checking.
    Each method represents a compliance rule based on NDPA 2023 articles.
    """

    def __init__(self):
        self.findings: List[Finding] = []

    def run_all_checks(self, data: Dict[str, Any]) -> List[Finding]:
        """Run all compliance checks against provided data."""
        self.findings = []

        # Data Privacy Rules
        self._check_consent_management(data)
        self._check_data_minimization(data)
        self._check_purpose_limitation(data)

        # Access Control Rules
        self._check_access_controls(data)
        self._check_authentication(data)
        self._check_authorization(data)

        # Data Retention Rules
        self._check_data_retention(data)
        self._check_deletion_procedures(data)

        # Security Rules
        self._check_encryption(data)
        self._check_audit_logging(data)
        self._check_breach_notification(data)

        # Data Subject Rights
        self._check_data_subject_access(data)
        self._check_rectification(data)
        self._check_erasure(data)

        return self.findings

    def _check_consent_management(self, data: Dict[str, Any]):
        """NDPA 2023 Article 25 - Consent Management"""
        if not data.get("consent_records"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art25",
                severity=Severity.CRITICAL,
                description="No consent management system detected",
                recommendation="Implement a consent management system that records when, how, and what consent was obtained from data subjects."
            ))

    def _check_data_minimization(self, data: Dict[str, Any]):
        """NDPA 2023 Article 27 - Data Minimization"""
        personal_data_fields = data.get("personal_data_fields", [])
        if len(personal_data_fields) > 20:
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art27",
                severity=Severity.HIGH,
                description=f"Collecting {len(personal_data_fields)} personal data fields, may exceed data minimization requirements",
                recommendation="Review collected data fields and ensure only necessary data is collected for the specified purpose."
            ))

    def _check_purpose_limitation(self, data: Dict[str, Any]):
        """NDPA 2023 Article 28 - Purpose Limitation"""
        if not data.get("purpose_statements"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art28",
                severity=Severity.HIGH,
                description="No purpose limitation documentation found",
                recommendation="Document and communicate the specific purposes for which personal data is collected and processed."
            ))

    def _check_access_controls(self, data: Dict[str, Any]):
        """NDPA 2023 Article 31 - Access Controls"""
        if not data.get("access_control_policy"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art31",
                severity=Severity.CRITICAL,
                description="No access control policy detected",
                recommendation="Implement role-based access controls (RBAC) to restrict access to personal data based on job function."
            ))

    def _check_authentication(self, data: Dict[str, Any]):
        """NDPA 2023 Article 32 - Authentication"""
        auth_methods = data.get("authentication_methods", [])
        if "mfa" not in auth_methods:
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art32",
                severity=Severity.HIGH,
                description="Multi-factor authentication not implemented",
                recommendation="Implement multi-factor authentication (MFA) for all systems accessing personal data."
            ))

    def _check_authorization(self, data: Dict[str, Any]):
        """NDPA 2023 Article 33 - Authorization"""
        if not data.get("authorization_audit_trail"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art33",
                severity=Severity.MEDIUM,
                description="No authorization audit trail detected",
                recommendation="Maintain detailed logs of all authorization decisions and access grants/denials."
            ))

    def _check_data_retention(self, data: Dict[str, Any]):
        """NDPA 2023 Article 35 - Data Retention"""
        if not data.get("retention_policy"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art35",
                severity=Severity.HIGH,
                description="No data retention policy found",
                recommendation="Establish and document data retention periods. Implement automated deletion or anonymization of data after retention period expires."
            ))

    def _check_deletion_procedures(self, data: Dict[str, Any]):
        """NDPA 2023 Article 36 - Deletion Procedures"""
        if not data.get("deletion_procedures"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art36",
                severity=Severity.MEDIUM,
                description="No secure deletion procedures detected",
                recommendation="Implement secure deletion procedures that ensure personal data is irretrievably destroyed when no longer needed."
            ))

    def _check_encryption(self, data: Dict[str, Any]):
        """NDPA 2023 Article 38 - Encryption"""
        encryption = data.get("encryption", {})
        if not encryption.get("at_rest"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art38-Rest",
                severity=Severity.CRITICAL,
                description="Data at rest encryption not implemented",
                recommendation="Encrypt all personal data at rest using industry-standard encryption (AES-256 or equivalent)."
            ))
        if not encryption.get("in_transit"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art38-Transit",
                severity=Severity.CRITICAL,
                description="Data in transit encryption not implemented",
                recommendation="Encrypt all personal data in transit using TLS 1.2 or higher."
            ))

    def _check_audit_logging(self, data: Dict[str, Any]):
        """NDPA 2023 Article 40 - Audit Logging"""
        if not data.get("audit_logging"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art40",
                severity=Severity.HIGH,
                description="Audit logging not implemented",
                recommendation="Implement comprehensive audit logging for all access to and processing of personal data."
            ))

    def _check_breach_notification(self, data: Dict[str, Any]):
        """NDPA 2023 Article 42 - Breach Notification"""
        if not data.get("breach_notification_procedure"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art42",
                severity=Severity.CRITICAL,
                description="No breach notification procedure found",
                recommendation="Establish a breach notification procedure that notifies NDPC within 72 hours of becoming aware of a breach."
            ))

    def _check_data_subject_access(self, data: Dict[str, Any]):
        """NDPA 2023 Article 45 - Data Subject Access Requests"""
        if not data.get("dsar_procedure"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art45",
                severity=Severity.HIGH,
                description="No data subject access request procedure found",
                recommendation="Implement a procedure to handle data subject access requests within 30 days."
            ))

    def _check_rectification(self, data: Dict[str, Any]):
        """NDPA 2023 Article 46 - Right to Rectification"""
        if not data.get("rectification_procedure"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art46",
                severity=Severity.MEDIUM,
                description="No data rectification procedure found",
                recommendation="Implement a procedure to allow data subjects to rectify inaccurate personal data."
            ))

    def _check_erasure(self, data: Dict[str, Any]):
        """NDPA 2023 Article 47 - Right to Erasure"""
        if not data.get("erasure_procedure"):
            self.findings.append(Finding(
                rule_id="NDPA-2023-Art47",
                severity=Severity.HIGH,
                description="No data erasure procedure found",
                recommendation="Implement a procedure to allow data subjects to request erasure of their personal data."
            ))


# Rule definitions for database seeding
COMPLIANCE_RULES = [
    {
        "rule_id": "NDPA-2023-Art25",
        "article": "Article 25",
        "title": "Consent Management",
        "description": "Data controllers must obtain explicit, informed consent before collecting or processing personal data.",
        "category": "data_privacy",
    },
    {
        "rule_id": "NDPA-2023-Art27",
        "article": "Article 27",
        "title": "Data Minimization",
        "description": "Personal data collected must be adequate, relevant, and limited to what is necessary.",
        "category": "data_privacy",
    },
    {
        "rule_id": "NDPA-2023-Art28",
        "article": "Article 28",
        "title": "Purpose Limitation",
        "description": "Personal data must be collected for specified, explicit, and legitimate purposes.",
        "category": "data_privacy",
    },
    {
        "rule_id": "NDPA-2023-Art31",
        "article": "Article 31",
        "title": "Access Controls",
        "description": "Appropriate technical and organizational measures must be implemented to control access to personal data.",
        "category": "access_control",
    },
    {
        "rule_id": "NDPA-2023-Art32",
        "article": "Article 32",
        "title": "Authentication",
        "description": "Strong authentication mechanisms must be implemented for systems processing personal data.",
        "category": "access_control",
    },
    {
        "rule_id": "NDPA-2023-Art33",
        "article": "Article 33",
        "title": "Authorization",
        "description": "Access to personal data must be restricted based on role and need-to-know basis.",
        "category": "access_control",
    },
    {
        "rule_id": "NDPA-2023-Art35",
        "article": "Article 35",
        "title": "Data Retention",
        "description": "Personal data must not be kept longer than necessary for the purposes for which it is processed.",
        "category": "retention",
    },
    {
        "rule_id": "NDPA-2023-Art36",
        "article": "Article 36",
        "title": "Deletion Procedures",
        "description": "Secure procedures must be in place for the deletion of personal data when no longer needed.",
        "category": "retention",
    },
    {
        "rule_id": "NDPA-2023-Art38",
        "article": "Article 38",
        "title": "Encryption",
        "description": "Personal data must be encrypted both at rest and in transit using industry-standard encryption.",
        "category": "security",
    },
    {
        "rule_id": "NDPA-2023-Art40",
        "article": "Article 40",
        "title": "Audit Logging",
        "description": "Comprehensive audit logs must be maintained for all access to and processing of personal data.",
        "category": "security",
    },
    {
        "rule_id": "NDPA-2023-Art42",
        "article": "Article 42",
        "title": "Breach Notification",
        "description": "Data breaches must be reported to NDPC within 72 hours of becoming aware of the breach.",
        "category": "security",
    },
    {
        "rule_id": "NDPA-2023-Art45",
        "article": "Article 45",
        "title": "Data Subject Access Requests",
        "description": "Data subjects have the right to access their personal data and receive a copy within 30 days.",
        "category": "data_subject_rights",
    },
    {
        "rule_id": "NDPA-2023-Art46",
        "article": "Article 46",
        "title": "Right to Rectification",
        "description": "Data subjects have the right to have inaccurate personal data rectified.",
        "category": "data_subject_rights",
    },
    {
        "rule_id": "NDPA-2023-Art47",
        "article": "Article 47",
        "title": "Right to Erasure",
        "description": "Data subjects have the right to have their personal data erased (right to be forgotten).",
        "category": "data_subject_rights",
    },
]
