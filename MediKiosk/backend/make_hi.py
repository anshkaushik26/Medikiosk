# -*- coding: utf-8 -*-
import json

with open("frontend/src/i18n/en.ts", "r", encoding="utf-8") as f:
    content = f.read()

json_text = content.replace("export const en = ", "").rstrip(";\n")
data = json.loads(json_text)

# Common
data["common"]["appName"] = "\u092e\u0947\u0921\u0940\u0915\u093f\u092f\u094b\u0938\u094d\u0915 (MEDIKIOSK)"
data["common"]["tagline"] = "\u0906\u092a\u0915\u0940 \u0938\u094d\u0935\u093e\u0938\u094d\u0925्\u092f \u091c\u093e\u0928\u0915\u093e\u0930\u0940, \u090f\u0915 \u0906\u0938\u093e\u0928 \u091c\u0917\u0939 \u092a\u0930\u0964"
data["common"]["continue"] = "\u0906\u0917\u0947 \u092c\u0922\u093c\u0947\u0902"
data["common"]["back"] = "\u092a\u0940\u091b\u0947 \u091c\u093e\u090f\u0902"
data["common"]["skip"] = "\u091b\u094b\u0921़\u0947\u0902 (\u092c\u093e\u0926 \u092e\u0947\u0902 \u092d\u0930\u0947\u0902)"
data["common"]["save"] = "\u0938\u0941\u0930\u0915्\u0937\u093f\u0924 \u0915\u0930\u0947ं"
data["common"]["finish"] = "\u0938\u092e\u093e\u092a्\u0924 \u0915\u0930\u0947ं"
data["common"]["cancel"] = "\u0930\u0926\u094d\u0926 \u0915\u0930\u0947ं"
data["common"]["logout"] = "\u0932\u0949\u0917 \u0906\u0909\u091f \u0915\u0930\u0947ं"
data["common"]["settings"] = "\u0938\u0947\u091fि\u0902\u0917्\u0938"
data["common"]["loading"] = "\u0915ृ\u092a\u092f\u093e \u092a्\u0930\u0924ी\u0915्\u0937\u093e \u0915\u0930\u0947ं..."
data["common"]["optional"] = "\u0935\u0948\u0915\u0932्\u092aि\u0915"
data["common"]["required"] = "\u0905\u0928ि\u0935\u093e\u0930्\u092f"
data["common"]["completed"] = "\u092aू\u0930्\u0923"
data["common"]["resetDemo"] = "\u0921\u0947\u092e\u094b \u0921\u0947\u091f\u093e \u0930ी\u0938\u0947\u091f \u0915\u0930\u0947ं"
data["common"]["edit"] = "\u092c\u0926\u0932\u0947ं"
data["common"]["delete"] = "\u0939\u091f\u093e\u090fं"
data["common"]["add"] = "\u091c\u094b\u0921़\u0947ं"
data["common"]["view"] = "\u0926\u0947\u0916\u0947ं"
data["common"]["status"] = "\u0938्\u0925ि\u0924ि"
data["common"]["notes"] = "\u091fि\u092a्\u092aणी"
data["common"]["date"] = "\u0924\u093e\u0930ी\u0916"
data["common"]["all"] = "\u0938\u092d\u0940"
data["common"]["newestFirst"] = "\u0928\u090f \u092a\u0939\u0932\u0947"
data["common"]["oldestFirst"] = "\u092aु\u0930\u093e\u0928\u0947 \u092a\u0939\u0932\u0947"
data["common"]["speakInstead"] = "\u092c\u094b\u0932\u0915\u0930 \u092c\u0924\u093e\u090fं"
data["common"]["savedOnDevice"] = "\u0907\u0938 \u092bो\u0928 \u092a\u0930 \u0938\u0941\u0930\u0915्\u0937\u093f\u0924 (\u0911\u092b\u0932\u093e\u0907\u0928)"

# Welcome
data["welcome"]["title"] = "\u092e\u0947\u0921\u0940\u0915\u093f\u092f\u094b\u0938\u094d\u0915 \u092e\u0947\u0902 \u0906\u092a\u0915\u093e \u0938\u094d\u0935\u093e\u0917\u0924 \u0939\u0948"
data["welcome"]["subtitle"] = "\u0906\u092a\u0915\u0940 \u0938\u094d\u0935\u093e\u0938\u094d\u0925्\u092f \u091c\u093e\u0928\u0915\u093e\u0930ी, \u090f\u0915 \u0906\u0938\u093e\u0928 \u091c\u0917\u0939 \u092a\u0930\u0964"
data["welcome"]["description"] = "\u0921ॉ\u0915्\u091f\u0930 \u0938\u0947 \u092eि\u0932\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0905\u092a\u0928ी \u092cी\u092e\u093e\u0930ी \u0935 \u0926\u0935\u093e\u0908\u092fों \u0915ी \u091c\u093e\u0928\u0915\u093e\u0930ी \u0906\u0938\u093e\u0928ी \u0938\u0947 \u0924\u0948\u092f\u093e\u0930 \u0915\u0930\u0947ं\u0964"
data["welcome"]["getStarted"] = "\u0936\u0941\u0930\u0942 \u0915\u0930\u0947ं"
data["welcome"]["alreadyHaveAccount"] = "\u092e\u0947\u0930\u093e \u092a\u0939\u0932\u0947 \u0938\u0947 \u0916\u093e\u0924\u093e \u0939\u0948"

# Benefits
data["benefits"]["title"] = "\u092e\u0947\u0921\u0940\u0915\u093f\u092f\u094b\u0938\u094d\u0915 \u0915ै\u0938\u0947 \u092e\u0926\u0926 \u0915\u0930\u0924\u093e \u0939\u0948"
data["benefits"]["subtitle"] = "\u0938\u0930\u0932, \u0938\u0941\u0930\u0915्\u0937\u093f\u0924 \u0914\u0930 3 \u0906\u0938\u093e\u0928 \u091a\u0930\u0923ों \u092e\u0947ं \u0924\u0948\u092f\u093e\u0930"
data["benefits"]["benefit1_title"] = "\u0905\u092a\u0928ी \u0938\u0947\u0939\u0924 \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947ं \u092c\u094b\u0932\u0915\u0930 \u092c\u0924\u093e\u090fं"
data["benefits"]["benefit1_desc"] = "\u0905\u092a\u0928ी \u0906\u0935\u093e\u091c़ \u092f\u093e \u0938\u0930\u0932 \u0935\u093f\u0915\u0932्\u092aों \u0938\u0947 \u092c\u0924\u093e\u090fं \u0915ि \u0906\u092a \u0915ै\u0938\u093e \u092e\u0939\u0938\u0942\u0938 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948ं\u0964"
data["benefits"]["benefit2_title"] = "\u0938\u093e\u0930\u0947 \u092a\u0930्\u091a\u0947 \u0935 \u0930\u093f\u092aो\u0930्\u091f \u090f\u0915 \u091c\u0917\u0939 \u0930\u0916\u0947ं"
data["benefits"]["benefit2_desc"] = "\u0921ॉ\u0915्\u091f\u0930 \u0915\u0947 \u092a\u0930्\u091a\u0947, \u0916\u0942\u0928 \u0915ी \u091c\u093e\u0902\u091a \u0914\u0930 \u0930ि\u092aो\u0930्\u091f \u090f\u0915 \u0938\u0941\u0930\u0915्\u0937\u093f\u0924 \u091c\u0917\u0939 \u0930\u0916\u0947ं\u0964"
data["benefits"]["benefit3_title"] = "\u0921ॉ\u0915्\u091f\u0930 \u0938\u0947 \u092eि\u0932\u0928\u0947 \u0915ी \u092c\u0947\u0939\u0924\u0930 \u0924\u0948\u092f\u093e\u0930ी"
data["benefits"]["benefit3_desc"] = "\u0921ॉ\u0915्\u091f\u0930 \u0915ो \u0926ि\u0916\u093e\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0906\u092a\u0915ी \u092eु\u0916्\u092f \u091c\u093e\u0928\u0915\u093e\u0930ी \u0935्\u092f\u0935\u0938्\u0925ि\u0924 \u0939\u094b \u091c\u093e\u0924ी \u0939\u0948\u0964"
data["benefits"]["continueToLogin"] = "\u0938\u093e\u0907\u0928 \u0907\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0906\u0917\u0947 \u092c\u0922़\u0947\u0902"

# Patient Dashboard
data["patientDashboard"]["welcomeBack"] = "\u0928\u092e\u0938्\u0924े"
data["patientDashboard"]["subtitle"] = "\u0906\u092a\u0915ी \u0938्\u0935\u093e\u0938्\u0925्\u092f \u091c\u093e\u0928\u0915\u093e\u0930ी \u092f\u0939\u093eं \u0938ु\u0930\u0915्\u0937\u093f\u0924 \u0939\u0948\u0964 \u0906\u092a \u0915\u092dी \u092dी \u0907\u0938\u0947 \u091c\u094b\u0921़ \u092f\u093e \u092c\u0926\u0932 \u0938\u0915\u0924\u0947 \u0939\u0948ं\u0964"
data["patientDashboard"]["actionTalk"] = "\u092e\u0947\u0921ी\u0915ि\u092fो\u0938्\u0915 \u0938\u0947 \u092c\u094b\u0932\u0947\u0902"
data["patientDashboard"]["actionReports"] = "\u092e\u0947\u0930ी \u0930ि\u092aो\u0930्\u091fें"
data["patientDashboard"]["actionMedicines"] = "\u092e\u0947\u0930ी \u0926\u0935\u093e\u0907\u092fाँ"
data["patientDashboard"]["actionHealth"] = "\u092e\u0947\u0930ी \u0938\u0947\u0939\u0924"
data["patientDashboard"]["actionTimeline"] = "\u092e\u0947\u0921ि\u0915ल \u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928"
data["patientDashboard"]["completionStatus"] = "\u0938्\u0935\u093e\u0938्\u0925्\u092f \u092a्\u0930ो\u092bा\u0907\u0932 \u0938्\u0925ि\u0924ि"
data["patientDashboard"]["recentActivity"] = "\u0939\u093e\u0932 \u0915ी \u0917\u0924ि\u0935ि\u0927ि\u092fाँ"
data["patientDashboard"]["emergencyHeader"] = "\u0906\u092a\u093e\u0924\u0915\u093e\u0932ी\u0928 \u0938\u0939\u093e\u092f\u0924\u093e"

# Health
data["health"]["title"] = "\u092e\u0947\u0930ी \u0938\u0947\u0939\u0924 \u0915\u093e \u0930ि\u0915ॉ\u0930्\u0921"
data["health"]["atAGlance"] = "\u0906\u092a\u0915\u093e \u0938\u094d\u0935\u093e\u0938्\u0925्\u092f \u090f\u0915 \u0928\u091c़\u0930 \u092e\u0947ं"
data["health"]["conditionsCount"] = "\u092cी\u092e\u093e\u0930ि\u092fाँ"
data["health"]["medicinesCount"] = "\u0926\u0935\u093e\u0907\u092fाँ"
data["health"]["allergiesCount"] = "\u090f\u0932\u0930्\u091cी"
data["health"]["reportsCount"] = "\u0930ि\u092aो\u0930्\u091fें"
data["health"]["surgeriesCount"] = "\u0938\u0930्\u091c\u0930ी"
data["health"]["secConditions"] = "\u0938्\u0935\u093e\u0938्\u0925्\u092f \u0938्\u0925ि\u0924ि\u092fाँ"
data["health"]["secMedicines"] = "\u091a\u0932 \u0930\u0939ी \u0926\u0935\u093e\u0907\u092fाँ"
data["health"]["secAllergies"] = "\u0926\u0935\u093e \u0935 \u0905\u0928्\u092f \u090f\u0932\u0930्\u091cी"
data["health"]["secFamily"] = "\u092a\u0930ि\u0935\u093e\u0930 \u0915\u093e \u0938्\u0935\u093e\u0938्\u0925्\u092f"
data["health"]["secSurgeries"] = "\u092aु\u0930\u093e\u0928े \u0911\u092a\u0930े\u0936\u0928 \u0935 \u0938\u0930्\u091c\u0930ी"
data["health"]["secAyurveda"] = "\u0906\u092aकी \u0906\u092f\u0941\u0930्\u0935े\u0926 \u092a्\u0930ो\u092bा\u0907\u0932"
data["health"]["btnAddCondition"] = "+ \u092cी\u092e\u093e\u0930ी \u091c\u094b\u0921़\u0947ं"
data["health"]["btnAddMedicine"] = "+ \u0926\u0935\u093e \u091c\u094b\u0921़\u0947ं"
data["health"]["btnAddAllergy"] = "+ \u090f\u0932\u0930्\u091cी \u091c\u094b\u0921़\u0947ं"
data["health"]["btnAddFamily"] = "+ \u092a\u0930ि\u0935\u093e\u0930 \u0915\u093e \u0930ि\u0915ॉ\u0930्\u0921"
data["health"]["btnAddSurgery"] = "+ \u092aु\u0930\u093e\u0928ा \u0911\u092a\u0930े\u0936\u0928"
data["health"]["btnOpenTimeline"] = "\u092e\u0947\u0921ि\u0915ल \u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928 \u0926ेखें \u2192"

# Conditions
data["conditions"]["title"] = "\u0938्\u0935\u093e\u0938्\u0925्\u092f \u0938्\u0925ि\u0924ि\u092fाँ"
data["conditions"]["addTitle"] = "\u092cी\u092e\u093e\u0930ी \u091c\u094b\u0921़\u0947ं"
data["conditions"]["editTitle"] = "\u092cी\u092e\u093e\u0930ी \u0915ी \u091c\u093e\u0928का\u0930ी \u092c\u0926\u0932ें"

# Medicines
data["medicines"]["title"] = "\u0926\u0935\u093e\u0907\u092fाँ"
data["medicines"]["addTitle"] = "\u0926\u0935\u093e\u0907\u092fाँ \u091c\u094b\u0921़\u0947ं"
data["medicines"]["editTitle"] = "\u0926\u0935\u093e\u0907\u092fाँ \u092c\u0926\u0932ें"
data["medicines"]["btnStop"] = "\u0932े\u0928ा \u092cं\u0926 \u0915\u0930\u0947ं"

# Allergies
data["allergies"]["title"] = "\u0926\u0935\u093e \u0935 \u090f\u0932\u0930्\u091cी"
data["allergies"]["addTitle"] = "\u090f\u0932\u0930्\u091cी \u0926\u0930्\u091c \u0915\u0930\u0947ं"

# Family
data["family"]["title"] = "\u092a\u0930ि\u0935\u093e\u0930 \u0915\u093e \u0938्\u0935\u093e\u0938्\u0925्\u092f"
data["family"]["addTitle"] = "\u092a\u0930ि\u0935\u093e\u0930 \u0915\u093e \u0930ि\u0915ॉ\u0930्\u0921 \u091c\u094b\u0921़\u0947ं"

# Surgeries
data["surgeries"]["title"] = "\u092aु\u0930\u093e\u0928े \u0911\u092aरे\u0936\u0928 \u0935 \u0938\u0930्\u091c\u0930ी"
data["surgeries"]["addTitle"] = "\u0938\u0930्\u091c\u0930ी \u091c\u094b\u0921़\u0947ं"

# Reports
data["reports"]["title"] = "\u092e\u0947\u0930ी \u092e\u0947\u0921ि\u0915\u0932 \u0930ि\u092aो\u0930्\u091fें"
data["reports"]["btnTakePhoto"] = "\u092bो\u091fो \u0916ीं\u091aें (Camera)"
data["reports"]["btnChooseFile"] = "\u092b़ा\u0907\u0932 \u0905\u092a\u0932ो\u0921 \u0915\u0930\u0947ं"

# Timeline
data["timeline"]["title"] = "\u092e\u0947\u0921ि\u0915ल \u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928"
data["timeline"]["filterAll"] = "\u0938\u092dी \u0918ट\u0928ा\u090fं"
data["timeline"]["filterReports"] = "\u0930ि\u092aो\u0930्\u091fें"
data["timeline"]["filterMedicines"] = "\u0926\u0935\u093eइ\u092fाँ"
data["timeline"]["filterConditions"] = "\u092cी\u092e\u093e\u0930ि\u092fाँ"
data["timeline"]["filterSurgeries"] = "\u0911\u092aरे\u0936\u0928"
data["timeline"]["filterAllergies"] = "\u090f\u0932र्\u091cी"

raw_str = json.dumps(data, indent=2)
decoded_str = raw_str.encode('utf-8').decode('unicode_escape')

with open("frontend/src/i18n/hi.ts", "w", encoding="utf-8") as f:
    f.write("export const hi = " + decoded_str + ";\n")

print("hi.ts updated completely with Hindi strings!")
