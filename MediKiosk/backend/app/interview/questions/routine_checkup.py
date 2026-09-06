"""Routine Check-up question branch with existing patient record awareness."""
from typing import Dict, Any, Optional
from backend.app.interview.questions.base import QuestionBranch
from backend.app.interview.state import QuestionDTO, QuestionOption


class RoutineCheckupBranch(QuestionBranch):
    @property
    def branch_name(self) -> str:
        return "ROUTINE_CHECKUP"

    @property
    def chief_complaint(self) -> str:
        return "Routine Health Check-up"

    def get_first_question(self, patient_context: Optional[Dict[str, Any]] = None) -> QuestionDTO:
        return self.get_question_by_id("RC_REASON", patient_context)

    def get_question_by_id(self, question_id: str, patient_context: Optional[Dict[str, Any]] = None) -> Optional[QuestionDTO]:
        ctx = patient_context or {}
        existing_conds = ctx.get("conditions", [])
        existing_meds = ctx.get("medications", [])

        if question_id == "RC_REASON":
            return QuestionDTO(
                id="RC_REASON",
                branch=self.branch_name,
                text="What is the primary reason for your health check-up today?",
                text_hi="आज आपके स्वास्थ्य जांच का मुख्य कारण क्या है?",
                voice_prompt="What brings you for a check-up today?",
                voice_prompt_hi="आज स्वास्थ्य जांच का मुख्य कारण क्या है?",
                step_label="Step 1 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="GENERAL", label="General annual check-up", label_hi="नियमित वार्षिक जांच", icon="clipboard-check"),
                    QuestionOption(id="REFILL", label="Medicine review and refill", label_hi="दवाइयों की समीक्षा और पर्चा", icon="pill"),
                    QuestionOption(id="SUGAR_BP", label="Blood sugar / BP check", label_hi="शुगर या ब्लड प्रेशर की जांच", icon="heart-pulse"),
                    QuestionOption(id="NEW_SYMPTOM", label="Mild recent symptoms", label_hi="हाल ही में हल्की परेशानी", icon="activity"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "RC_CONFIRM_CONDITIONS":
            cond_names = ", ".join([c.get("condition_name", "") for c in existing_conds[:3]])
            return QuestionDTO(
                id="RC_CONFIRM_CONDITIONS",
                branch=self.branch_name,
                text=f"We have a record that you have {cond_names}. Are these conditions currently active and under management?",
                text_hi=f"हमारे रिकॉर्ड में दर्ज है कि आपको {cond_names} है। क्या ये स्वास्थ्य स्थितियां अभी भी सक्रिय हैं?",
                voice_prompt=f"We see in your record that you have {cond_names}. Are you still managing these conditions?",
                voice_prompt_hi=f"आपके रिकॉर्ड में {cond_names} दर्ज है। क्या यह अभी भी जारी है?",
                step_label="Step 2 of 4",
                answer_type="RECORD_CONFIRM",
                options=[
                    QuestionOption(id="STILL_ACTIVE", label="Yes, currently managing these", label_hi="हाँ, अभी भी इलाज चल रहा है", icon="check-circle"),
                    QuestionOption(id="RESOLVED", label="No, some are resolved / changed", label_hi="नहीं, कुछ ठीक हो चुके हैं या बदल गए हैं", icon="edit"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "RC_GENERAL_CONDITIONS":
            return QuestionDTO(
                id="RC_GENERAL_CONDITIONS",
                branch=self.branch_name,
                text="Do you have any ongoing health conditions like diabetes, high BP, or asthma?",
                text_hi="क्या आपको डायबिटीज, हाई ब्लड प्रेशर या अस्थमा जैसी कोई पुरानी बीमारी है?",
                step_label="Step 2 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="NONE", label="No ongoing conditions", label_hi="कोई बीमारी नहीं है", icon="check"),
                    QuestionOption(id="YES", label="Yes, have chronic conditions", label_hi="हाँ, पुरानी बीमारी है", icon="heart-pulse"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "RC_CONFIRM_MEDS":
            med_names = ", ".join([m.get("medicine_name", "") for m in existing_meds[:3]])
            return QuestionDTO(
                id="RC_CONFIRM_MEDS",
                branch=self.branch_name,
                text=f"We have {med_names} listed in your medicines. Are you taking your medicines regularly as advised?",
                text_hi=f"आपकी दवाइयों में {med_names} दर्ज हैं। क्या आप अपनी दवाइयां डॉक्टर की सलाह अनुसार नियमित ले रहे हैं?",
                voice_prompt=f"We have {med_names} in your medicines. Are you taking them regularly?",
                voice_prompt_hi=f"क्या आप {med_names} नियमित रूप से ले रहे हैं?",
                step_label="Step 3 of 4",
                answer_type="RECORD_CONFIRM",
                options=[
                    QuestionOption(id="REGULAR", label="Yes, taking all regularly", label_hi="हाँ, नियमित रूप से ले रहे हैं", icon="pill"),
                    QuestionOption(id="MISSED", label="Sometimes miss a dose", label_hi="कभी-कभार छूट जाती है", icon="clock"),
                    QuestionOption(id="STOPPED", label="Stopped or changed some medicines", label_hi="कुछ दवाइयां बंद या बदल दी हैं", icon="alert-circle"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "RC_GENERAL_MEDS":
            return QuestionDTO(
                id="RC_GENERAL_MEDS",
                branch=self.branch_name,
                text="Are you currently taking any prescription medicines on a daily basis?",
                text_hi="क्या आप रोजाना कोई डॉक्टर की दवा ले रहे हैं?",
                step_label="Step 3 of 4",
                answer_type="CHOICE",
                options=[
                    QuestionOption(id="NO", label="No daily medicines", label_hi="कोई दैनिक दवा नहीं", icon="check"),
                    QuestionOption(id="YES", label="Yes, taking daily medicines", label_hi="हाँ, नियमित दवा ले रहे हैं", icon="pill"),
                ],
                allow_voice=True,
                allow_text=True,
            )
        elif question_id == "RC_WELLBEING":
            return QuestionDTO(
                id="RC_WELLBEING",
                branch=self.branch_name,
                text="How would you rate your general energy and wellbeing over the past month?",
                text_hi="पिछले एक महीने में आपकी सामान्य ऊर्जा और स्वास्थ्य कैसा रहा है?",
                voice_prompt="How has your general health and energy been lately?",
                voice_prompt_hi="हाल ही में आपका स्वास्थ्य कैसा रहा है?",
                step_label="Step 4 of 4",
                answer_type="SCALE",
                options=[
                    QuestionOption(id="GOOD", label="Feeling energetic and healthy", label_hi="अच्छा और ऊर्जावान महसूस हो रहा है", icon="smile"),
                    QuestionOption(id="FAIR", label="Fair — feeling a bit tired or sluggish", label_hi="ठीक-ठाक — थोड़ी थकान महसूस होती है", icon="meh"),
                    QuestionOption(id="POOR", label="Poor — struggling with daily activities", label_hi="कमजोर — रोजमर्रा के कामों में परेशानी", icon="frown"),
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
        ctx = patient_context or {}
        has_conds = bool(ctx.get("conditions", []))
        has_meds = bool(ctx.get("medications", []))

        if current_question_id == "RC_REASON":
            next_id = "RC_CONFIRM_CONDITIONS" if has_conds else "RC_GENERAL_CONDITIONS"
            return self.get_question_by_id(next_id, patient_context)
        elif current_question_id in ["RC_CONFIRM_CONDITIONS", "RC_GENERAL_CONDITIONS"]:
            next_id = "RC_CONFIRM_MEDS" if has_meds else "RC_GENERAL_MEDS"
            return self.get_question_by_id(next_id, patient_context)
        elif current_question_id in ["RC_CONFIRM_MEDS", "RC_GENERAL_MEDS"]:
            return self.get_question_by_id("RC_WELLBEING", patient_context)
        return None
