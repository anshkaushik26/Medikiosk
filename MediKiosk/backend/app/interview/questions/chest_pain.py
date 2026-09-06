"""Chest Pain clinical question branch."""
from typing import Dict, Any, Optional
from backend.app.interview.questions.base import QuestionBranch
from backend.app.interview.state import QuestionDTO, QuestionOption


class ChestPainBranch(QuestionBranch):
    @property
    def branch_name(self) -> str:
        return "CHEST_PAIN"

    @property
    def chief_complaint(self) -> str:
        return "Chest Pain"

    def get_first_question(self, patient_context: Optional[Dict[str, Any]] = None) -> QuestionDTO:
        return self.get_question_by_id("CP_ONSET", patient_context)

    def get_question_by_id(self, question_id: str, patient_context: Optional[Dict[str, Any]] = None) -> Optional[QuestionDTO]:
        if question_id == "CP_ONSET":
            return QuestionDTO(
                id="CP_ONSET",
                branch=self.branch_name,
                text="When did the chest pain start?",
                text_hi="सीने में दर्द कब शुरू हुआ था?",
                voice_prompt="When did your chest pain start? You can tell us in your own words.",
                voice_prompt_hi="सीने में दर्द कब शुरू हुआ था? आप बोलकर बता सकते हैं।",
                step_label="Step 1 of 5",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="TODAY", label="Today (Just started)", label_hi="आज (अभी शुरू हुआ)", icon="clock"),
                    QuestionOption(id="YESTERDAY", label="Yesterday", label_hi="कल", icon="calendar"),
                    QuestionOption(id="FEW_DAYS", label="A few days ago", label_hi="कुछ दिन पहले", icon="calendar-days"),
                    QuestionOption(id="LONG_TIME", label="More than a week ago", label_hi="एक हफ्ते से ज्यादा पहले", icon="history"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "CP_LOCATION":
            return QuestionDTO(
                id="CP_LOCATION",
                branch=self.branch_name,
                text="Where do you feel the pain in your chest?",
                text_hi="सीने में दर्द किस जगह महसूस हो रहा है?",
                voice_prompt="Where exactly in your chest is the pain?",
                voice_prompt_hi="सीने में किस जगह दर्द है?",
                step_label="Step 2 of 5",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="CENTER", label="Middle of my chest", label_hi="सीने के बीच में", icon="target"),
                    QuestionOption(id="LEFT", label="Left side of my chest", label_hi="सीने के बाईं तरफ", icon="arrow-left"),
                    QuestionOption(id="RIGHT", label="Right side of my chest", label_hi="सीने के दाईं तरफ", icon="arrow-right"),
                    QuestionOption(id="ALL_OVER", label="Across my entire chest", label_hi="पूरे सीने में फैला हुआ", icon="maximize"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "CP_CHARACTER":
            return QuestionDTO(
                id="CP_CHARACTER",
                branch=self.branch_name,
                text="What does the pain feel like?",
                text_hi="दर्द कैसा महसूस हो रहा है?",
                voice_prompt="What does the pain feel like? For example, pressure, heaviness, sharp, or burning?",
                voice_prompt_hi="दर्द कैसा है? दबाव, भारीपन, चुभन या जलन?",
                step_label="Step 3 of 5",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="PRESSURE", label="Heavy pressure / Tightness", label_hi="भारी दबाव या जकड़न", icon="weight"),
                    QuestionOption(id="BURNING", label="Burning sensation", label_hi="जलन जैसा दर्द", icon="flame"),
                    QuestionOption(id="SHARP", label="Sharp / Stabbing pain", label_hi="तेज़ चुभन जैसा दर्द", icon="zap"),
                    QuestionOption(id="DULL", label="Dull, constant ache", label_hi="हल्का लगातार मीठा दर्द", icon="circle-dot"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "CP_SEVERITY":
            return QuestionDTO(
                id="CP_SEVERITY",
                branch=self.branch_name,
                text="How strong is the pain right now?",
                text_hi="इस समय दर्द कितना तेज है?",
                voice_prompt="How severe is the pain right now?",
                voice_prompt_hi="दर्द कितना तेज है?",
                step_label="Step 4 of 5",
                answer_type="SCALE",
                options=[
                    QuestionOption(id="MILD", label="Mild — noticeable but bearable", label_hi="हल्का — सहन करने योग्य", icon="smile"),
                    QuestionOption(id="MODERATE", label="Moderate — hard to ignore", label_hi="मध्यम — नजरअंदाज करना मुश्किल", icon="meh"),
                    QuestionOption(id="SEVERE", label="Severe — very strong", label_hi="बहुत तेज — असहनीय", icon="frown"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "CP_RADIATION":
            return QuestionDTO(
                id="CP_RADIATION",
                branch=self.branch_name,
                text="Does the pain move to your arm, shoulder, jaw, or back?",
                text_hi="क्या यह दर्द आपके हाथ, कंधे, जबड़े या पीठ में भी फैलता है?",
                voice_prompt="Does the pain move to your arm, neck, jaw, shoulder or back?",
                voice_prompt_hi="क्या दर्द हाथ, कंधे, जबड़े या पीठ में जा रहा है?",
                step_label="Step 5 of 6",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="YES_ARM", label="Yes, to my left arm or shoulder", label_hi="हाँ, बाएं हाथ या कंधे में", icon="arrow-up-right"),
                    QuestionOption(id="YES_JAW", label="Yes, to my jaw, neck, or back", label_hi="हाँ, जबड़े, गर्दन या पीठ में", icon="arrow-up"),
                    QuestionOption(id="NO", label="No, stays only in chest", label_hi="नहीं, केवल सीने में ही है", icon="check"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "CP_BREATHING":
            return QuestionDTO(
                id="CP_BREATHING",
                branch=self.branch_name,
                text="Are you having trouble breathing or shortness of breath?",
                text_hi="क्या आपको सांस लेने में तकलीफ या सांस फूलने की समस्या हो रही है?",
                voice_prompt="Are you having shortness of breath or difficulty breathing?",
                voice_prompt_hi="क्या आपको सांस लेने में तकलीफ हो रही है?",
                step_label="Important Safety Check",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="YES", label="Yes, having trouble breathing", label_hi="हाँ, सांस लेने में तकलीफ है", icon="alert-circle"),
                    QuestionOption(id="NO", label="No, breathing is normal", label_hi="नहीं, सांस बिल्कुल सामान्य है", icon="check-circle"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "CP_SWEATING":
            return QuestionDTO(
                id="CP_SWEATING",
                branch=self.branch_name,
                text="Are you feeling unusually sweaty, dizzy, or faint?",
                text_hi="क्या आपको असामान्य पसीना आ रहा है, या चक्कर आ रहे हैं?",
                voice_prompt="Are you experiencing unusual sweating, dizziness, or lightheadedness?",
                voice_prompt_hi="क्या असामान्य पसीना या चक्कर आ रहे हैं?",
                step_label="Final Question",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="YES", label="Yes, feeling sweaty or dizzy", label_hi="हाँ, पसीना या चक्कर आ रहा है", icon="droplet"),
                    QuestionOption(id="NO", label="No, feeling otherwise fine", label_hi="नहीं, ऐसा कुछ नहीं है", icon="check"),
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
            "CP_ONSET",
            "CP_LOCATION",
            "CP_CHARACTER",
            "CP_SEVERITY",
            "CP_RADIATION",
            "CP_BREATHING",
            "CP_SWEATING",
        ]
        if current_question_id in progression:
            idx = progression.index(current_question_id)
            if idx + 1 < len(progression):
                next_id = progression[idx + 1]
                return self.get_question_by_id(next_id, patient_context)
        return None
