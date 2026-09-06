"""Fever clinical question branch."""
from typing import Dict, Any, Optional
from backend.app.interview.questions.base import QuestionBranch
from backend.app.interview.state import QuestionDTO, QuestionOption


class FeverBranch(QuestionBranch):
    @property
    def branch_name(self) -> str:
        return "FEVER"

    @property
    def chief_complaint(self) -> str:
        return "Fever"

    def get_first_question(self, patient_context: Optional[Dict[str, Any]] = None) -> QuestionDTO:
        return self.get_question_by_id("FEVER_ONSET", patient_context)

    def get_question_by_id(self, question_id: str, patient_context: Optional[Dict[str, Any]] = None) -> Optional[QuestionDTO]:
        if question_id == "FEVER_ONSET":
            return QuestionDTO(
                id="FEVER_ONSET",
                branch=self.branch_name,
                text="How long have you had this fever?",
                text_hi="आपको बुखार कितने समय से है?",
                voice_prompt="How many days have you had the fever?",
                voice_prompt_hi="आपको कितने दिनों से बुखार है?",
                step_label="Step 1 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="TODAY", label="Started today", label_hi="आज ही शुरू हुआ है", icon="clock"),
                    QuestionOption(id="FEW_DAYS", label="2 to 3 days", label_hi="2 से 3 दिन से", icon="calendar"),
                    QuestionOption(id="ABOUT_WEEK", label="About a week", label_hi="लगभग 1 हफ्ते से", icon="calendar-days"),
                    QuestionOption(id="MORE_WEEK", label="More than a week", label_hi="एक हफ्ते से ज्यादा से", icon="history"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "FEVER_TEMP":
            return QuestionDTO(
                id="FEVER_TEMP",
                branch=self.branch_name,
                text="Have you checked your temperature with a thermometer?",
                text_hi="क्या आपने थर्मामीटर से तापमान नापा है?",
                voice_prompt="Have you measured your body temperature?",
                voice_prompt_hi="क्या आपने बुखार नापा है?",
                step_label="Step 2 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="HIGH", label="High fever (above 102°F)", label_hi="तेज बुखार (102°F से ऊपर)", icon="flame"),
                    QuestionOption(id="MODERATE", label="Moderate (100°F to 102°F)", label_hi="मध्यम (100°F से 102°F)", icon="thermometer"),
                    QuestionOption(id="MILD", label="Mild fever (under 100°F)", label_hi="हल्का बुखार (100°F से कम)", icon="thermometer-snowflake"),
                    QuestionOption(id="NOT_CHECKED", label="Haven't measured", label_hi="नापा नहीं है, बस गर्म लग रहा है", icon="help-circle"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "FEVER_CHILLS":
            return QuestionDTO(
                id="FEVER_CHILLS",
                branch=self.branch_name,
                text="Do you have shivering or cold chills with the fever?",
                text_hi="क्या बुखार के साथ कंपकंपी या ठंड लग रही है?",
                voice_prompt="Are you experiencing shivering or chills?",
                voice_prompt_hi="क्या कंपकंपी या ठंड लग रही है?",
                step_label="Step 3 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="YES", label="Yes, shivering and chills", label_hi="हाँ, कंपकंपी और ठंड लगती है", icon="wind"),
                    QuestionOption(id="NO", label="No chills", label_hi="नहीं, ठंड नहीं लगती", icon="check"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "FEVER_BREATHING":
            return QuestionDTO(
                id="FEVER_BREATHING",
                branch=self.branch_name,
                text="Are you having any difficulty breathing or fast breathing?",
                text_hi="क्या आपको सांस लेने में कोई परेशानी या सांस तेज चल रही है?",
                voice_prompt="Are you having trouble breathing or fast breathing?",
                voice_prompt_hi="क्या सांस लेने में कोई परेशानी है?",
                step_label="Important Safety Check",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="SEVERE", label="Yes, severe difficulty breathing", label_hi="हाँ, सांस लेने में बहुत तकलीफ है", icon="alert-triangle"),
                    QuestionOption(id="MILD", label="Mild shortness of breath", label_hi="थोड़ी सांस फूल रही है", icon="alert-circle"),
                    QuestionOption(id="NO", label="No breathing difficulty", label_hi="नहीं, सांस सामान्य है", icon="check-circle"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "FEVER_COUGH":
            return QuestionDTO(
                id="FEVER_COUGH",
                branch=self.branch_name,
                text="Do you also have a cough or sore throat?",
                text_hi="क्या आपको खांसी या गले में खराश भी है?",
                voice_prompt="Do you have a cough or throat pain?",
                voice_prompt_hi="क्या खांसी या गले में दर्द है?",
                step_label="Final Question",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="YES", label="Yes, have cough / sore throat", label_hi="हाँ, खांसी या गले में खराश है", icon="activity"),
                    QuestionOption(id="NO", label="No cough", label_hi="नहीं, खांसी नहीं है", icon="check"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        return None

    def get_next_question(
        self,
        current_question_id: str,
        answers: Dict[str, Any],
        patient_context: Optional[Dict[str, Any]] = None
    ) -> Optional[QuestionDTO]:
        progression = [
            "FEVER_ONSET",
            "FEVER_TEMP",
            "FEVER_CHILLS",
            "FEVER_BREATHING",
            "FEVER_COUGH",
        ]
        if current_question_id in progression:
            idx = progression.index(current_question_id)
            if idx + 1 < len(progression):
                next_id = progression[idx + 1]
                return self.get_question_by_id(next_id, patient_context)
        return None
