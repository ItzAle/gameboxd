import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

export default function PlatformStats({ userProfile }) {
  const [genreStats, setGenreStats] = useState([]);
  const [developerStats, setDeveloperStats] = useState([]);
  const [publisherStats, setPublisherStats] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [barOrientation, setBarOrientation] = useState("vertical");
  const [animate, setAnimate] = useState(true);

  const colorPalettes = {
    default: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"],
    pastel: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"],
    vibrant: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
    earthy: ["#D4A373", "#CCD5AE", "#E9EDC9", "#FEFAE0", "#FAEDCD"],
    neon: ["#FF00FF", "#00FFFF", "#FF00CC", "#00FF00", "#FFA500"],
  };

  const [selectedPalette, setSelectedPalette] = useState("default");

  useEffect(() => {
    const fetchGamesData = async () => {
      if (!userProfile || !userProfile.library) {
        console.error("userProfile o userProfile.library no existe");
        setError("No se encontró información de la biblioteca de juegos.");
        setIsLoading(false);
        return;
      }

      try {
        const relevantGames = userProfile.library.filter(
          (game) => game.status === "playing" || game.status === "completed"
        );

        setTotalGames(relevantGames.length);

        const genreCounts = {};
        const developerCounts = {};
        const publisherCounts = {};

        relevantGames.forEach((game) => {
          if (game.genres && Array.isArray(game.genres)) {
            game.genres.forEach((genre) => {
              if (typeof genre === "string" && genre.trim() !== "") {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
              }
            });
          }
          if (game.developer) {
            developerCounts[game.developer] =
              (developerCounts[game.developer] || 0) + 1;
          }
          if (game.publisher) {
            publisherCounts[game.publisher] =
              (publisherCounts[game.publisher] || 0) + 1;
          }
        });

        const sortAndSlice = (obj) =>
          Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        setGenreStats(sortAndSlice(genreCounts));
        setDeveloperStats(sortAndSlice(developerCounts));
        setPublisherStats(sortAndSlice(publisherCounts));
        setIsLoading(false);
      } catch (error) {
        console.error("Error al procesar datos de juegos:", error);
        setError(
          `No se pudieron procesar los datos de juegos: ${error.message}`
        );
        setIsLoading(false);
      }
    };

    fetchGamesData();
  }, [userProfile]);

  if (isLoading)
    return (
      <p>
        <Loader2 className="w-4 h-4 animate-spin" />
      </p>
    );
  if (error) return <p>Error: {error}</p>;
  if (totalGames === 0)
    return (
      <p>
        You don&apos;t have games in the &apos;playing&apos; or
        &apos;completed&apos; status.
      </p>
    );

  const renderBarChart = (data, title) => (
    <div className="w-full h-64 mb-8">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={barOrientation === "vertical" ? "vertical" : "horizontal"}
        >
          {barOrientation === "vertical" ? (
            <>
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
              <YAxis type="number" />
            </>
          )}
          <Tooltip />
          <Bar
            dataKey="count"
            animationBegin={0}
            animationDuration={animate ? 750 : 0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  colorPalettes[selectedPalette][
                    index % colorPalettes[selectedPalette].length
                  ]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPieChart = (data, title) => (
    <div className="w-full sm:w-1/3 h-64 mb-8 flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="w-full h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={60}
              fill="#8884d8"
              dataKey="count"
              animationBegin={0}
              animationDuration={animate ? 750 : 0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    colorPalettes[selectedPalette][
                      index % colorPalettes[selectedPalette].length
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderChart = (data, title) =>
    chartType === "bar"
      ? renderBarChart(data, title)
      : renderPieChart(data, title);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="bg-gray-700 text-white rounded px-2 py-1"
        >
          <option value="bar">Bars</option>
          <option value="pie">Circles</option>
        </select>
        {chartType === "bar" && (
          <>
            <select
              value={selectedPalette}
              onChange={(e) => setSelectedPalette(e.target.value)}
              className="bg-gray-700 text-white rounded px-2 py-1"
            >
              <option value="default">Default</option>
              <option value="pastel">Pastel</option>
              <option value="vibrant">Vibrant</option>
              <option value="earthy">Earthy</option>
              <option value="neon">Neon</option>
            </select>
            <select
              value={barOrientation}
              onChange={(e) => setBarOrientation(e.target.value)}
              className="bg-gray-700 text-white rounded px-2 py-1"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </>
        )}
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={animate}
            onChange={(e) => setAnimate(e.target.checked)}
            className="mr-2"
          />
          Animate
        </label>
      </div>
      <div
        className={`${
          chartType === "pie" ? "flex flex-wrap justify-center" : ""
        }`}
      >
        {renderChart(genreStats, "Genres most played")}
        {renderChart(developerStats, "Developers most frequent")}
        {renderChart(publisherStats, "Publishers most frequent")}
      </div>
    </div>
  );
}
