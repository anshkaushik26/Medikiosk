"""Cough clinical question branch."""
from typing import Dict, Any, Optional
from backend.app.interview.questions.base import QuestionBranch
from backend.app.interview.state import QuestionDTO, QuestionOption


class CoughBranch(QuestionBranch):
    @property
    def branch_name(self) -> str:
        return "COUGH"

    @property
    def chief_complaint(self) -> str:
        return "Cough"

    def get_first_question(self, patient_context: Optional[Dict[str, Any]] = None) -> QuestionDTO:
        return self.get_question_by_id("COUGH_DURATION", patient_context)

    def get_question_by_id(self, question_id: str, patient_context: Optional[Dict[str, Any]] = None) -> Optional[QuestionDTO]:
        if question_id == "COUGH_DURATION":
            return QuestionDTO(
                id="COUGH_DURATION",
                branch=self.branch_name,
                text="How long have you had this cough?",
                text_hi="आपको यह खांसी कितने दिनों से है?",
                voice_prompt="How long have you been coughing?",
                voice_prompt_hi="खांसी कितने दिनों से है?",
                step_label="Step 1 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="FEW_DAYS", label="A few days (less than a week)", label_hi="कुछ दिनों से (1 हफ्ते से कम)", icon="calendar"),
                    QuestionOption(id="ONE_TWO_WEEKS", label="1 to 2 weeks", label_hi="1 से 2 हफ्ते से", icon="calendar-days"),
                    QuestionOption(id="MORE_THREE_WEEKS", label="More than 3 weeks", label_hi="3 हफ्ते से ज्यादा से", icon="history"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "COUGH_TYPE":
            return QuestionDTO(
                id="COUGH_TYPE",
                branch=self.branch_name,
                text="Is your cough dry, or does it bring up phlegm (sputum)?",
                text_hi="खांसी सूखी है, या बलगम आ रहा है?",
                voice_prompt="Is it a dry cough or a productive cough with phlegm?",
                voice_prompt_hi="क्या सूखी खांसी है या बलगम वाली?",
                step_label="Step 2 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="DRY", label="Dry cough (no phlegm)", label_hi="सूखी खांसी (बलगम नहीं)", icon="wind"),
                    QuestionOption(id="WET", label="Wet cough (bringing up phlegm)", label_hi="गीली खांसी (बलगम आ रहा है)", icon="droplet"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "COUGH_BLOOD":
            return QuestionDTO(
                id="COUGH_BLOOD",
                branch=self.branch_name,
                text="Have you noticed any blood or red streaks in your phlegm?",
                text_hi="क्या बलगम में खून या लाल रंग का कोई निशान दिखा है?",
                voice_prompt="Have you noticed any blood in your cough?",
                voice_prompt_hi="क्या खांसी या बलगम में खून आया है?",
                step_label="Important Safety Check",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="YES", label="Yes, noticed blood", label_hi="हाँ, खून दिखाई दिया है", icon="alert-triangle"),
                    QuestionOption(id="NO", label="No blood at all", label_hi="नहीं, कोई खून नहीं है", icon="check-circle"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "COUGH_BREATHING":
            return QuestionDTO(
                id="COUGH_BREATHING",
                branch=self.branch_name,
                text="Are you having trouble breathing, wheezing, or chest tightness?",
                text_hi="क्या आपको सांस लेने में तकलीफ, सीटी जैसी आवाज या सीने में जकड़न है?",
                voice_prompt="Do you have breathing difficulty or wheezing?",
                voice_prompt_hi="क्या सांस फूल रही है या सीटी की आवाज आ रही है?",
                step_label="Final Question",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="SEVERE", label="Yes, severe difficulty breathing", label_hi="हाँ, सांस लेने में बहुत परेशानी है", icon="alert-circle"),
                    QuestionOption(id="MILD", label="Mild shortness of breath", label_hi="हल्की सांस फूल रही है", icon="activity"),
                    QuestionOption(id="NO", label="No, breathing is comfortable", label_hi="नहीं, सांस बिल्कुल ठीक है", icon="check"),
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
            "COUGH_DURATION",
            "COUGH_TYPE",
            "COUGH_BLOOD",
            "COUGH_BREATHING",
        ]
        if current_question_id in progression:
            idx = progression.index(current_question_id)
            if idx + 1 < len(progression):
                next_id = progression[idx + 1]
                return self.get_question_by_id(next_id, patient_context)
        return None
