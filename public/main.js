const socket = io();
socket.on("friendAdded", function (data) {
  // Display a notification when a friend is added
  displayNotification("You have a new friend request!");
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

// Function to display a notification
function displayNotification(message) {
  const notification = document.createElement("div");
  console.log("Notification: ", message);
  notification.classList.add("notification");
  notification.textContent = message;
  document.body.appendChild(notification);
  // Remove the notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
