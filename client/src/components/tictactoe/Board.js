import { useEffect, useState } from "react";
import Cell from "./Cell";
import "./board.css";

const Board = ({ socket, roomCode }) => {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [canPlay, setCanPlay] = useState(true);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    socket.on("updateGame", (id) => {
      console.log("use Effect", id);
      setBoard(prevBoard => {
        const newBoard = [...prevBoard];
        newBoard[id] = "O";
        return newBoard;
      });
      setCanPlay(true);
    });

    return () => socket.off("updateGame");
  }, []);

  useEffect(() => {
    checkWinner();
  }, [board]);

  const handleCellClick = (e) => {
    const id = e.currentTarget.id;
    if (canPlay && board[id] === "") {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[id] = "X";
        return newBoard;
      });
      socket.emit("play", { id, roomCode });
      setCanPlay(false);
    }
  };

      const checkWinner = () => {
        if (
          (board[0] && board[0] === board[1] && board[0] === board[2]) || // Top row
          (board[3] && board[3] === board[4] && board[3] === board[5]) || // Middle row
          (board[6] && board[6] === board[7] && board[6] === board[8]) || // Bottom row
          (board[0] && board[0] === board[3] && board[0] === board[6]) || // Left column
          (board[1] && board[1] === board[4] && board[1] === board[7]) || // Middle column
          (board[2] && board[2] === board[5] && board[2] === board[8]) || // Right column
          (board[0] && board[0] === board[4] && board[0] === board[8]) || // Diagonal from top-left to bottom-right
          (board[2] && board[2] === board[4] && board[2] === board[6])    // Diagonal from top-right to bottom-left
        ) {
          setWinner(board[0]);
        } else if (!board.includes("")) {
          setWinner("Draw");
        }
      };

      const handleReset = () => {
        setBoard(["", "", "", "", "", "", "", "", ""]);
        setWinner("");
      };
      return (
        <main>
          <section className="board-section">
            <Cell handleCellClick={handleCellClick} id={"0"} text={board[0]} />
            <Cell handleCellClick={handleCellClick} id={"1"} text={board[1]} />
            <Cell handleCellClick={handleCellClick} id={"2"} text={board[2]} />

            <Cell handleCellClick={handleCellClick} id={"3"} text={board[3]} />
            <Cell handleCellClick={handleCellClick} id={"4"} text={board[4]} />
            <Cell handleCellClick={handleCellClick} id={"5"} text={board[5]} />

            <Cell handleCellClick={handleCellClick} id={"6"} text={board[6]} />
            <Cell handleCellClick={handleCellClick} id={"7"} text={board[7]} />
            <Cell handleCellClick={handleCellClick} id={"8"} text={board[8]} />
          </section>

          {winner && (
            <div className="winner-message">
              {winner === "Draw" ? (
                <p>It's a draw!</p>
              ) : (
                <p>{winner} won the game!</p>
              )}
              <button onClick={handleReset}>Reset</button>
            </div>
          )}
        </main>
      );
    };

    export default Board;
