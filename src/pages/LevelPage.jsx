import { useParams } from "react-router-dom";
import GameBoard from "../components/GameBoard";

export default function LevelPage() {
  const { level } = useParams();

  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto">
        <GameBoard level={Number(level)} />
      </div>
    </div>
  );
}
