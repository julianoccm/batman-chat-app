const socket = io("http://localhost:3000");

const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const messageContainer = document.getElementById("message-container");

if (messageForm != null) {
  const name = prompt("Qual seu nome?").toUpperCase();
  appendMessage(">> VOCÊ CONECTOU.");
  socket.emit("new-user", roomName, name);

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = messageInput.value;

    appendMessage(`>> YOU: ${message}`);
    socket.emit("send-chat-message", roomName, message);

    messageInput.value = "";
  });
}

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerHTML = message.toUpperCase();

  if (message.startsWith(">> YOU")) {
    messageElement.classList.add("you-text");
  }

  messageContainer.append(messageElement);
  messageElement.scrollIntoView({behavior: "smooth"});
}

socket.on("chat-message", (data) => {
  appendMessage(`>> ${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
  appendMessage(`>> ${name} CONECTOU.`);
});

socket.on("user-disconnected", (name) => {
  appendMessage(`>> ${name} DISCONECTOU.`);
});
