from voice_engine.intent.parser import IntentParser
from voice_engine.wakeword.detector import wakeword_detector
from voice_engine.tts.engine import tts_engine

def test_intent_parser():
    # Test confirmation intents
    res1 = IntentParser.parse_intent("I have finished taking my medicine")
    assert res1["intent"] == "CONFIRMATION"

    res2 = IntentParser.parse_intent("Task done")
    assert res2["intent"] == "CONFIRMATION"

    # Test emergency intents
    res3 = IntentParser.parse_intent("Help me I fell down")
    assert res3["intent"] == "EMERGENCY"

    # Test unknown intent
    res4 = IntentParser.parse_intent("What is the weather outside")
    assert res4["intent"] == "UNKNOWN"

def test_wakeword_and_tts():
    assert wakeword_detector.trigger_activation("Hey CareBot help me") is True
    assert wakeword_detector.trigger_activation("Good morning world") is False
    assert tts_engine.speak("Testing offline speech engine") is True
