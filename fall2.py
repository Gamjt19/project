import speech_recognition as sr

# Create recognizer instance
recognizer = sr.Recognizer()

print("🎤 Say 'help' or 'ammey' to trigger the alert...")

while True:
    try:
        with sr.Microphone() as source:
            print("Listening...")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source)

        try:
            text = recognizer.recognize_google(audio).lower()
            print(f"You said: {text}")

            if "help" in text or "ammey" in text:
                print("🚨 ALERT: Help needed!")

        except sr.UnknownValueError:
            print("Could not understand audio")
        except sr.RequestError as e:
            print(f"Speech recognition service error: {e}")

    except KeyboardInterrupt:
        print("\nExiting...")
        break
