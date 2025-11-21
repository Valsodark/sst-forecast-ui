import './App.css'
import { useState } from "react";
import { useEffect } from "react";

interface PredictResponse {
    image: string;
    min_temperature: number;
    max_temperature: number;
    shape: number[];
}

const DATA_TODAY_DATE = new Date();
const weekdays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Get today's index

const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(DATA_TODAY_DATE);
    date.setDate(DATA_TODAY_DATE.getDate() + i);

    return {
        index: i, // current day = 0, next day = 1, ..., last day = 6
        dayName: weekdays[date.getDay()],
        date: date.getDate(),
    };
});

function App() {
    const [imgSrc, setImgSrc] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [minValue, setMinValue] = useState<number | null>(null);
    const [maxValue, setMaxValue] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0); // 0 = first day is active

    const fetchPrediction = async () => {
        setLoading(true);
        setImgSrc("");
        setMinValue(null);
        setMaxValue(null);

        try {
            const response = await fetch("http://127.0.0.1:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    day_index: activeIndex
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data: PredictResponse = await response.json();
            setImgSrc(data.image);
            setMinValue(data.min_temperature);
            setMaxValue(data.max_temperature);
        } catch (err) {
            console.error("Error fetching prediction:", err);
            alert("Failed to fetch prediction. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrediction().then();
    }, []);

  return (
      <>
          <div className="navbar bg-base-100 fixed top-0 left-0 w-full shadow-sm z-50">
              <div className="navbar-start"></div>
              <div className="navbar-center">
                  <p className="text-xl font-semibold">Sea Surface Temp Anomaly</p>
              </div>
              <div className="navbar-end"></div>
          </div>

          {/* MAIN CONTENT */}
          <div className="hero bg-base-200 min-h-screen">
              {/* Loader */}

              {
                  loading && <div className="skeleton w-full max-w-4xl aspect-video rounded-lg"></div>
              }
              {/* Image */}
              <div>
                  {
                      imgSrc && <img src={imgSrc} className="
                                                            w-full max-w-4xl
                                                            md:max-w-3xl
                                                            lg:max-w-4xl
                                                            aspect-video
                                                            rounded-lg shadow-2xl object-cover"/>
                  }
                    <div className={"w-full h-[25px] lg:h-[30px] "}></div>
                  {/* Gradient Bar */}
                  <div className="relative w-full max-w-4xl md:max-w-3xl lg:max-w-4xl h-9 rounded-full overflow-hidden shadow">

                      <div
                          className="absolute inset-0"
                          style={{
                              background: "linear-gradient(to right, #cc0101, #ffffff, #073467)",
                          }}
                      ></div>

                      <div className="absolute inset-0 flex justify-between items-center px-4 text-lg font-bold">
            <span className="text-white drop-shadow">
                {maxValue?.toFixed(2)} °C
            </span>
                          <span className="text-black drop-shadow">0 °C</span>
                          <span className="text-white drop-shadow">
                {minValue?.toFixed(2)} °C
            </span>
                      </div>
                  </div>
              </div>
          </div>

          {/* DOCK AT THE BOTTOM */}
          <div className="dock bg-neutral text-neutral-content text-xl">
              {weekDates.map((dayObj) => (
                  <button
                      key={dayObj.index}
                      disabled={loading}
                      className={dayObj.index === activeIndex ? "dock-active" : "hover:bg-base-300 hover:shadow-md transition-all duration-300"}
                      onClick={() =>{
                          setActiveIndex(dayObj.index);
                          fetchPrediction().then();
                      } }
                  >
                      <span className="dock-label">{dayObj.dayName}</span>
                      <span className="dock-date">{dayObj.date}</span>
                  </button>
              ))}
          </div>
      </>
  )
}

export default App
