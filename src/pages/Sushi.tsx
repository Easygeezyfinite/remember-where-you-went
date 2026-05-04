import { useState, useEffect, useRef } from "react";
import RetroMediaPlayer from "@/components/RetroMediaPlayer";

type DateOption = {
  label: string;
  date: string;
  time: string;
  dateTime: string;
};

const dateOptions: DateOption[] = [
  { label: "Friday May 8th", date: "2026-05-08", time: "6:30 PM", dateTime: "20260508T183000" },
  { label: "Saturday May 9th", date: "2026-05-09", time: "6:00 PM", dateTime: "20260509T180000" },
  { label: "Wednesday May 13th", date: "2026-05-13", time: "6:30 PM", dateTime: "20260513T183000" },
];

function useInjectPressStart2P() {
  if (typeof document !== "undefined") {
    const id = "press-start-2p-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
      document.head.appendChild(link);
    }
  }
}

type Stage =
  | "initial"
  | "pickDate"
  | "enterEmailYes"
  | "enterAltDates"
  | "enterEmailNo"
  | "submitting"
  | "success"
  | "error";

export default function Sushi() {
  useInjectPressStart2P();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playlist = [
    {
      src: "/trim1_ethiop.mp3",
      title: "Tiziti and Jazz",
      artist: "Background Loop",
    },
  ];

  const [stage, setStage] = useState<Stage>("initial");
  const [selectedOption, setSelectedOption] = useState<DateOption | null>(null);
  const [suggestedDates, setSuggestedDates] = useState<string[]>(["", "", ""]);
  const [guestEmail, setGuestEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.45;

    audio.play().catch(() => {
      const playOnInteraction = () => {
        audio.play();
        document.removeEventListener("click", playOnInteraction);
      };

      document.addEventListener("click", playOnInteraction);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = playlist[currentTrackIndex].src;
    audio.load();
    audio.play().catch(() => {});
  }, [currentTrackIndex]);

  const validateDay = (dateString: string) => {
    if (!dateString) return true;

    const [year, month, day] = dateString.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const weekday = localDate.getDay();

    return weekday === 5 || weekday === 6 || weekday === 0;
  };

  const allDatesValid = suggestedDates.every(validateDay);
  const hasAtLeastOneDate = suggestedDates.some((d) => d);
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleDateChange = (index: number, value: string) => {
    const next = [...suggestedDates];
    next[index] = value;
    setSuggestedDates(next);
  };

  const submit = async () => {
    setStage("submitting");
    setErrorMessage("");

    const payload =
      selectedOption !== null
        ? {
            responseType: "yes" as const,
            guestEmail,
            selectedDate: {
              label: selectedOption.label,
              time: selectedOption.time,
              dateTime: selectedOption.dateTime,
            },
          }
        : {
            responseType: "no" as const,
            guestEmail,
            alternativeDates: suggestedDates.filter(Boolean),
          };

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `Server returned ${res.status}`;

        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}

        throw new Error(msg);
      }

      setStage("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const pixelFont = { fontFamily: "'Press Start 2P', cursive" };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 py-8 px-4 relative overflow-x-hidden">
      <audio ref={audioRef} src={playlist[currentTrackIndex].src} loop />

      <div className="fixed bottom-4 left-4 z-[9999] scale-75 sm:scale-100">
  <RetroMediaPlayer
    audioRef={audioRef}
    currentTrack={playlist[currentTrackIndex]}
    onNext={handleNextTrack}
    onPrev={handlePrevTrack}
  />
</div>

      <div className="relative max-w-2xl w-full mx-auto">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-white">
          <div className="relative h-96 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1080&q=80&auto=format&fit=crop"
              alt="Japanese castle"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>

          <div className="relative bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-8">
            <div className="mb-6">
              <h1
                className="text-center mb-4 drop-shadow-lg"
                style={{
                  ...pixelFont,
                  fontSize: "clamp(0.7rem, 2vw, 1.1rem)",
                  lineHeight: "1.6",
                  color: "#2563eb",
                  textShadow: "2px 2px 0px #fbbf24, 4px 4px 0px rgba(0,0,0,0.2)",
                }}
              >
                🍣 SUSHI DATE INVITE FOR V 🍣
              </h1>

              <p
                className="text-center mb-6 px-4"
                style={{
                  ...pixelFont,
                  fontSize: "clamp(0.5rem, 1.5vw, 0.75rem)",
                  lineHeight: "1.8",
                  color: "#dc2626",
                }}
              >
                Let's try and see if one of these dates fit your schedule. See the best option for you miss.
              </p>
            </div>

            {stage === "initial" && (
              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={() => setStage("pickDate")}
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-xl shadow-lg transform hover:scale-105 transition-all border-4 border-green-700"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.6rem, 1.5vw, 0.9rem)",
                    color: "white",
                    textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
                  }}
                >
                  YES! ✨
                </button>

                <button
                  onClick={() => setStage("enterAltDates")}
                  className="px-8 py-4 bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-xl shadow-lg transform hover:scale-105 transition-all border-4 border-red-700"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.6rem, 1.5vw, 0.9rem)",
                    color: "white",
                    textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
                  }}
                >
                  NO 😢
                </button>
              </div>
            )}

            {stage === "pickDate" && (
              <div className="mb-6 bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-2xl border-4 border-blue-400 shadow-xl">
                <p
                  className="text-center mb-4"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.5vw, 0.75rem)",
                    lineHeight: "1.8",
                    color: "#1e40af",
                  }}
                >
                  Pick your date! 🎌
                </p>

                <div className="space-y-3">
                  {dateOptions.map((option) => (
                    <button
                      key={option.date}
                      onClick={() => {
                        setSelectedOption(option);
                        setStage("enterEmailYes");
                      }}
                      className="w-full px-6 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all border-4 bg-white hover:bg-blue-50 border-blue-300"
                      style={{
                        ...pixelFont,
                        fontSize: "clamp(0.5rem, 1.2vw, 0.7rem)",
                        lineHeight: "1.6",
                        color: "#1e3a8a",
                      }}
                    >
                      {option.label}
                      <br />
                      <span className="text-pink-600">{option.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stage === "enterEmailYes" && selectedOption && (
              <div className="mb-6 bg-gradient-to-br from-yellow-100 to-pink-100 p-6 rounded-2xl border-4 border-pink-400 shadow-xl">
                <p
                  className="text-center mb-4"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.5vw, 0.75rem)",
                    lineHeight: "1.8",
                    color: "#9d174d",
                  }}
                >
                  You picked {selectedOption.label}!
                </p>

                <p
                  className="text-center mb-4"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.45rem, 1.2vw, 0.65rem)",
                    lineHeight: "1.8",
                    color: "#9d174d",
                  }}
                >
                  Drop your email so I can send you the calendar invite miss 💌
                </p>

                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-4 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none mb-3"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.2vw, 0.65rem)",
                  }}
                />

                <button
                  onClick={submit}
                  disabled={!isValidEmail(guestEmail)}
                  className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg shadow-lg border-4 border-pink-700 disabled:border-gray-400"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.2vw, 0.7rem)",
                    color: "white",
                  }}
                >
                  SEND CONFIRMATION 🍣
                </button>

                <button
                  onClick={() => {
                    setSelectedOption(null);
                    setStage("pickDate");
                  }}
                  className="w-full mt-2 text-pink-700 underline"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.4rem, 1vw, 0.55rem)",
                  }}
                >
                  ← pick a different date
                </button>
              </div>
            )}

            {stage === "enterAltDates" && (
              <div className="bg-white/80 p-6 rounded-xl border-4 border-purple-400">
                <p
                  className="mb-4"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.5vw, 0.7rem)",
                    lineHeight: "1.8",
                    color: "#7c3aed",
                  }}
                >
                  Suggest 3 dates that are better (Friday-Sunday only ha):
                </p>

                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      <input
                        type="date"
                        value={suggestedDates[index]}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                        className="w-full px-4 py-3 border-4 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        style={{
                          ...pixelFont,
                          fontSize: "clamp(0.5rem, 1.2vw, 0.65rem)",
                        }}
                      />

                      {suggestedDates[index] && !validateDay(suggestedDates[index]) && (
                        <p
                          className="mt-1 text-red-600"
                          style={{
                            ...pixelFont,
                            fontSize: "clamp(0.4rem, 1vw, 0.5rem)",
                            lineHeight: "1.6",
                          }}
                        >
                          Must be Fri-Sun!
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {hasAtLeastOneDate && allDatesValid && (
                  <button
                    onClick={() => setStage("enterEmailNo")}
                    className="mt-4 w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg shadow-lg border-4 border-purple-700"
                    style={{
                      ...pixelFont,
                      fontSize: "clamp(0.5rem, 1.2vw, 0.7rem)",
                      color: "white",
                    }}
                  >
                    NEXT 📅
                  </button>
                )}
              </div>
            )}

            {stage === "enterEmailNo" && (
              <div className="bg-white/80 p-6 rounded-xl border-4 border-purple-400">
                <p
                  className="mb-4"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.2vw, 0.7rem)",
                    lineHeight: "1.8",
                    color: "#7c3aed",
                  }}
                >
                  Drop your email so I can confirm one of those dates pls thnks:
                </p>

                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-4 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none mb-3"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.2vw, 0.65rem)",
                  }}
                />

                <button
                  onClick={submit}
                  disabled={!isValidEmail(guestEmail)}
                  className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg shadow-lg border-4 border-purple-700 disabled:border-gray-400"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.2vw, 0.7rem)",
                    color: "white",
                  }}
                >
                  SUBMIT 📅
                </button>
              </div>
            )}

            {stage === "submitting" && (
              <div className="text-center p-8 bg-blue-100 rounded-xl border-4 border-blue-400">
                <p
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.5vw, 0.75rem)",
                    lineHeight: "1.8",
                    color: "#1e40af",
                  }}
                >
                  Sending... 🍣
                </p>
              </div>
            )}

            {stage === "success" && (
              <div className="text-center p-8 bg-green-100 rounded-xl border-4 border-green-400">
                <p
                  className="mb-3"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.6rem, 1.8vw, 0.9rem)",
                    lineHeight: "1.8",
                    color: "#15803d",
                  }}
                >
                  ALL SET! 🎉
                </p>

                <p
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.45rem, 1.2vw, 0.65rem)",
                    lineHeight: "1.8",
                    color: "#15803d",
                  }}
                >
                  Check your inbox 📬
                  <br />
                  Check your spam lowkey for confirmation too lol
                </p>
              </div>
            )}

            {stage === "error" && (
              <div className="text-center p-6 bg-red-100 rounded-xl border-4 border-red-400">
                <p
                  className="mb-3"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.55rem, 1.5vw, 0.8rem)",
                    lineHeight: "1.8",
                    color: "#991b1b",
                  }}
                >
                  Hmm, that didn't work
                </p>

                <p
                  className="mb-4"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.4rem, 1vw, 0.55rem)",
                    lineHeight: "1.8",
                    color: "#991b1b",
                  }}
                >
                  {errorMessage}
                </p>

                <button
                  onClick={submit}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg shadow-lg border-4 border-red-700"
                  style={{
                    ...pixelFont,
                    fontSize: "clamp(0.5rem, 1.2vw, 0.7rem)",
                    color: "white",
                  }}
                >
                  TRY AGAIN MISS
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="absolute -top-4 -right-4 text-6xl animate-bounce">🌸</div>
        <div className="absolute -bottom-4 -left-4 text-6xl animate-bounce delay-100">⛩️</div>
      </div>
    </div>
  );
}