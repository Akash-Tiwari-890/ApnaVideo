// const localVideo = document.getElementById('localVideo');
// const lobbyForm = document.getElementById('lobbyForm');
// const lobbyInput = document.getElementById('lobbyInput');

// // Request access to the user's camera and microphone
// navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//     .then(stream => {
//         // Set the video source to the user's camera stream
//         localVideo.srcObject = stream;
//     })
//     .catch(error => {
//         console.error('Error accessing media devices.', error);
//         alert('Could not access your camera. Please check your permissions.');
//     });

// lobbyForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const lobbyName = lobbyInput.value.trim();
//     if (lobbyName) {
//         // Here, you would implement the logic to join the lobby.
//         // For example, you would use Socket.IO to emit a 'join-lobby' event
//         // and pass the lobbyName to the server.
//         console.log(`Joining lobby: ${lobbyName}`);
//         // Example: socket.emit('join-lobby', lobbyName);
//     }
// });