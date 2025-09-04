// Solitaire placeholder (for now)
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Background
ctx.fillStyle = "#228B22"; // green felt color
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Message
ctx.fillStyle = "#fff";
ctx.font = "28px Arial";
ctx.fillText("BlackJack game placeholder 🎴", 220, 300);
ctx.font = "18px Arial";
ctx.fillText("Cards would be dealt here...", 270, 340);
