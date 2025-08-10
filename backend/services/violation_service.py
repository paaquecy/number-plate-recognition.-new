from typing import Optional, List
from datetime import datetime
import uuid
from database.supabase_client import supabase
from models.violation import Violation, ViolationCreate, ViolationType, ViolationStatus, ViolationSeverity

class ViolationService:
    def __init__(self):
        pass

    async def create_violation(self, violation_data: ViolationCreate, reported_by: str) -> Violation:
        """Create a new violation record"""
        try:
            # Create violation data
            violation_dict = {
                "id": str(uuid.uuid4()),
                "plate_number": violation_data.plate_number,
                "violation_type": violation_data.violation_type.value,
                "severity": violation_data.severity.value,
                "location": violation_data.location,
                "description": violation_data.description,
                "fine_amount": violation_data.fine_amount,
                "evidence_image": violation_data.evidence_image,
                "officer_notes": violation_data.officer_notes,
                "status": "pending",
                "reported_by": reported_by,
                "reported_at": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Insert into Supabase
            response = supabase.table("violations").insert(violation_dict).execute()
            
            if not response.data:
                raise ValueError("Failed to create violation")
            
            created_violation = response.data[0]
            
            # Return Violation object
            return Violation(
                id=created_violation["id"],
                plate_number=created_violation["plate_number"],
                violation_type=ViolationType(created_violation["violation_type"]),
                severity=ViolationSeverity(created_violation["severity"]),
                location=created_violation["location"],
                description=created_violation["description"],
                fine_amount=created_violation["fine_amount"],
                evidence_image=created_violation.get("evidence_image"),
                officer_notes=created_violation.get("officer_notes"),
                status=ViolationStatus(created_violation["status"]),
                reported_by=created_violation["reported_by"],
                reported_at=datetime.fromisoformat(created_violation["reported_at"]),
                reviewed_by=created_violation.get("reviewed_by"),
                reviewed_at=datetime.fromisoformat(created_violation["reviewed_at"]) if created_violation.get("reviewed_at") else None,
                rejection_reason=created_violation.get("rejection_reason"),
                created_at=datetime.fromisoformat(created_violation["created_at"]),
                updated_at=datetime.fromisoformat(created_violation["updated_at"])
            )
            
        except Exception as e:
            print(f"Violation creation error: {e}")
            raise e

    async def get_violations(self, plate_number: Optional[str] = None, status: Optional[str] = None, user_id: Optional[str] = None) -> List[Violation]:
        """Get violations with optional filtering"""
        try:
            query = supabase.table("violations").select("*")
            
            if plate_number:
                query = query.eq("plate_number", plate_number)
            
            if status:
                query = query.eq("status", status)
            
            if user_id:
                query = query.eq("reported_by", user_id)
            
            response = query.execute()
            
            violations = []
            for violation_data in response.data:
                violation = Violation(
                    id=violation_data["id"],
                    plate_number=violation_data["plate_number"],
                    violation_type=ViolationType(violation_data["violation_type"]),
                    severity=ViolationSeverity(violation_data["severity"]),
                    location=violation_data["location"],
                    description=violation_data["description"],
                    fine_amount=violation_data["fine_amount"],
                    evidence_image=violation_data.get("evidence_image"),
                    officer_notes=violation_data.get("officer_notes"),
                    status=ViolationStatus(violation_data["status"]),
                    reported_by=violation_data["reported_by"],
                    reported_at=datetime.fromisoformat(violation_data["reported_at"]),
                    reviewed_by=violation_data.get("reviewed_by"),
                    reviewed_at=datetime.fromisoformat(violation_data["reviewed_at"]) if violation_data.get("reviewed_at") else None,
                    rejection_reason=violation_data.get("rejection_reason"),
                    created_at=datetime.fromisoformat(violation_data["created_at"]),
                    updated_at=datetime.fromisoformat(violation_data["updated_at"])
                )
                violations.append(violation)
            
            return violations
            
        except Exception as e:
            print(f"Get violations error: {e}")
            return []

    async def get_violation_by_id(self, violation_id: str) -> Optional[Violation]:
        """Get violation by ID"""
        try:
            response = supabase.table("violations").select("*").eq("id", violation_id).execute()
            
            if not response.data:
                return None
            
            violation_data = response.data[0]
            
            return Violation(
                id=violation_data["id"],
                plate_number=violation_data["plate_number"],
                violation_type=ViolationType(violation_data["violation_type"]),
                severity=ViolationSeverity(violation_data["severity"]),
                location=violation_data["location"],
                description=violation_data["description"],
                fine_amount=violation_data["fine_amount"],
                evidence_image=violation_data.get("evidence_image"),
                officer_notes=violation_data.get("officer_notes"),
                status=ViolationStatus(violation_data["status"]),
                reported_by=violation_data["reported_by"],
                reported_at=datetime.fromisoformat(violation_data["reported_at"]),
                reviewed_by=violation_data.get("reviewed_by"),
                reviewed_at=datetime.fromisoformat(violation_data["reviewed_at"]) if violation_data.get("reviewed_at") else None,
                rejection_reason=violation_data.get("rejection_reason"),
                created_at=datetime.fromisoformat(violation_data["created_at"]),
                updated_at=datetime.fromisoformat(violation_data["updated_at"])
            )
            
        except Exception as e:
            print(f"Get violation by ID error: {e}")
            return None

    async def approve_violation(self, violation_id: str, reviewer_id: str) -> bool:
        """Approve a violation (supervisor only)"""
        try:
            response = supabase.table("violations").update({
                "status": "approved",
                "reviewed_by": reviewer_id,
                "reviewed_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", violation_id).execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            print(f"Approve violation error: {e}")
            return False

    async def reject_violation(self, violation_id: str, reason: str, reviewer_id: str) -> bool:
        """Reject a violation (supervisor only)"""
        try:
            response = supabase.table("violations").update({
                "status": "rejected",
                "rejection_reason": reason,
                "reviewed_by": reviewer_id,
                "reviewed_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", violation_id).execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            print(f"Reject violation error: {e}")
            return False

    async def get_pending_violations(self) -> List[Violation]:
        """Get all pending violations for supervisor review"""
        try:
            response = supabase.table("violations").select("*").eq("status", "pending").execute()
            
            violations = []
            for violation_data in response.data:
                violation = Violation(
                    id=violation_data["id"],
                    plate_number=violation_data["plate_number"],
                    violation_type=ViolationType(violation_data["violation_type"]),
                    severity=ViolationSeverity(violation_data["severity"]),
                    location=violation_data["location"],
                    description=violation_data["description"],
                    fine_amount=violation_data["fine_amount"],
                    evidence_image=violation_data.get("evidence_image"),
                    officer_notes=violation_data.get("officer_notes"),
                    status=ViolationStatus(violation_data["status"]),
                    reported_by=violation_data["reported_by"],
                    reported_at=datetime.fromisoformat(violation_data["reported_at"]),
                    reviewed_by=violation_data.get("reviewed_by"),
                    reviewed_at=datetime.fromisoformat(violation_data["reviewed_at"]) if violation_data.get("reviewed_at") else None,
                    rejection_reason=violation_data.get("rejection_reason"),
                    created_at=datetime.fromisoformat(violation_data["created_at"]),
                    updated_at=datetime.fromisoformat(violation_data["updated_at"])
                )
                violations.append(violation)
            
            return violations
            
        except Exception as e:
            print(f"Get pending violations error: {e}")
            return []

    async def get_violation_statistics(self) -> dict:
        """Get violation statistics for dashboard"""
        try:
            # Get total violations
            total_response = supabase.table("violations").select("id", count="exact").execute()
            total_violations = total_response.count if total_response.count else 0
            
            # Get pending violations
            pending_response = supabase.table("violations").select("id", count="exact").eq("status", "pending").execute()
            pending_violations = pending_response.count if pending_response.count else 0
            
            # Get approved violations
            approved_response = supabase.table("violations").select("id", count="exact").eq("status", "approved").execute()
            approved_violations = approved_response.count if approved_response.count else 0
            
            # Get rejected violations
            rejected_response = supabase.table("violations").select("id", count="exact").eq("status", "rejected").execute()
            rejected_violations = rejected_response.count if rejected_response.count else 0
            
            # Get violations by type
            type_response = supabase.table("violations").select("violation_type").execute()
            violation_types = {}
            for violation in type_response.data:
                v_type = violation["violation_type"]
                violation_types[v_type] = violation_types.get(v_type, 0) + 1
            
            return {
                "total_violations": total_violations,
                "pending_violations": pending_violations,
                "approved_violations": approved_violations,
                "rejected_violations": rejected_violations,
                "violation_types": violation_types
            }
            
        except Exception as e:
            print(f"Get violation statistics error: {e}")
            return {
                "total_violations": 0,
                "pending_violations": 0,
                "approved_violations": 0,
                "rejected_violations": 0,
                "violation_types": {}
            } 