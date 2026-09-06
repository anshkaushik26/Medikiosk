"""Stomach Pain clinical question branch."""
from typing import Dict, Any, Optional
from backend.app.interview.questions.base import QuestionBranch
from backend.app.interview.state import QuestionDTO, QuestionOption


class StomachPainBranch(QuestionBranch):
    @property
    def branch_name(self) -> str:
        return "STOMACH_PAIN"

    @property
    def chief_complaint(self) -> str:
        return "Stomach Pain"

    def get_first_question(self, patient_context: Optional[Dict[str, Any]] = None) -> QuestionDTO:
        return QuestionDTO(
            id="STOMACH_LOCATION",
            branch=self.branch_name,
            text="Where in your stomach is the pain most noticeable?",
            text_hi="पेट में दर्द मुख्य रूप से किस जगह पर है?",
            voice_prompt="Where in your stomach do you feel the pain?",
            voice_prompt_hi="पेट में किस हिस्से में दर्द है?",
            step_label="Step 1 of 4",
            answer_type="CHOICE",
            options=[
                QuestionOption(id="UPPER", label="Upper stomach (near chest / center)", label_hi="ऊपरी पेट में (सीने के नीचे)", icon="arrow-up"),
                QuestionOption(id="LOWER_RIGHT", label="Lower right side", label_hi="निचले दाएं हिस्से में (दाहिनी तरफ)", icon="arrow-down-right"),
                QuestionOption(id="LOWER_LEFT", label="Lower left side", label_hi="निचले बाएं हिस्से में (बाईं तरफ)", icon="arrow-down-left"),
                QuestionOption(id="ALL_OVER", label="All over my stomach", label_hi="पूरे पेट में फैला हुआ", icon="maximize"),
            ],
            allow_voice=True,
            allow_text=True,
        )

    def get_next_question(
        self,
        current_question_id: str,
        answers: Dict[str, Any],
        patient_context: Optional[Dict[str, Any]] = None
    ) -> Optional[QuestionDTO]:
        if current_question_id == "STOMACH_LOCATION":
            return QuestionDTO(
                id="STOMACH_SEVERITY",
                branch=self.branch_name,
                text="How severe is the stomach pain?",
                text_hi="पेट का दर्द कितना तेज है?",
                voice_prompt="How severe is the stomach pain right now?",
                voice_prompt_hi="पेट का दर्द कितना तेज है?",
                step_label="Step 2 of 4",
                answer_type="SCALE",
                options=[
                    QuestionOption(id="MILD", label="Mild cramping / discomfort", label_hi="हल्की मरोड़ या बेचैनी", icon="smile"),
                    QuestionOption(id="MODERATE", label="Moderate constant pain", label_hi="मध्यम लगातार दर्द", icon="meh"),
                    QuestionOption(id="SEVERE", label="Severe unbearable pain", label_hi="बहुत तेज असहनीय दर्द", icon="frown"),
                ],
                allow_voice=True,
                allow_text=True,
            )

        elif current_question_id == "STOMACH_SEVERITY":
            return QuestionDTO(
                id="STOMACH_VOMIT",
                branch=self.branch_name,
                text="Are you experiencing nausea, vomiting, or diarrhea?",
                text_hi="क्या आपको उल्टी, दस्त या जी मिचलाने की समस्या है?",
                voice_prompt="Are you vomiting or having loose motions?",
                voice_prompt_hi="क्या उल्टी या दस्त हो रहे हैं?",
                step_label="Step 3 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="VOMIT_FREQUENT", label="Yes, frequent vomiting", label_hi="हाँ, बार-बार उल्टी हो रही है", icon="alert-circle"),
                    QuestionOption(id="DIARRHEA", label="Yes, loose motions / diarrhea", label_hi="हाँ, दस्त या लूज मोशन हैं", icon="activity"),
                    QuestionOption(id="NO", label="No vomiting or diarrhea", label_hi="नहीं, उल्टी या दस्त नहीं है", icon="check"),
                ],
                allow_voice=True,
                allow_text=True,
            )

        elif current_question_id == "STOMACH_VOMIT":
            return QuestionDTO(
                id="STOMACH_BLOOD",
                branch=self.branch_name,
                text="Have you seen any blood in your vomit or black/bloody stools?",
                text_hi="क्या उल्टी में खून या काले रंग का मल आया है?",
                voice_prompt="Have you noticed any blood in vomit or stools?",
                voice_prompt_hi="क्या उल्टी या शौच में खून आया है?",
                step_label="Important Safety Check",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="YES", label="Yes, noticed blood or black stool", label_hi="हाँ, खून या काला मल दिखा है", icon="alert-triangle"),
                    QuestionOption(id="NO", label="No, normal stools", label_hi="नहीं, ऐसा कुछ नहीं है", icon="check-circle"),
                ],
                allow_voice=True,
                allow_text=True,
            )

        return None
