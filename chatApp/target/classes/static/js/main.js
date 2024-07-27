'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var imageUpload = document.querySelector('#imageUpload');
var stompClient = null;
var username = null;

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('d-none');
        chatPage.classList.remove('d-none');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function onConnected() {
    stompClient.subscribe('/topic/public', onMessageReceived);

    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

var fileUpload = document.querySelector('#fileUpload');

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    var file = fileUpload.files[0];

    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };

        console.log('Sending chat message:', chatMessage);
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    } else if (file && stompClient) {
        if (file.size > 10 * 1024 * 1024) {
            alert('Файл слишком большой. Максимальный размер 10 МБ.');
            fileUpload.value = '';
            return;
        }

        var reader = new FileReader();
        reader.onload = function(event) {
            var fileType = getFileType(file);
            var chatMessage = {
                sender: username,
                type: fileType,
                fileData: event.target.result,
                fileName: file.name
            };
            console.log('Sending file message:', chatMessage);
            stompClient.send("/app/chat.sendFile", {}, JSON.stringify(chatMessage));
        };
        reader.readAsDataURL(file);
        fileUpload.value = '';
    }
    event.preventDefault();
}
function getFileType(file) {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type.startsWith('video/')) return 'VIDEO';
    if (file.type.startsWith('audio/')) return 'AUDIO';
    return 'CHAT';
}

function onMessageReceived(payload) {
    console.log('Received message:', payload);
    var message;
    try {
        message = JSON.parse(payload.body);
    } catch (error) {
        console.error('Error parsing message:', error);
        return;
    }
    console.log('Parsed message:', message);

    var messageElement = document.createElement('li');
    messageElement.classList.add('chat-message');

    var usernameElement = document.createElement('strong');
    usernameElement.classList.add('nickname');
    usernameElement.textContent = message.sender;
    messageElement.appendChild(usernameElement);

    console.log('Message type:', message.type);

    if (message.type === 'JOIN') {
        var textElement = document.createElement('span');
        textElement.textContent = ' присоединился к чату!';
        messageElement.appendChild(textElement);
    } else if (message.type === 'LEAVE') {
        var textElement = document.createElement('span');
        textElement.textContent = ' покинул чат!';
        messageElement.appendChild(textElement);
    } else if (message.type === 'CHAT') {
        var textElement = document.createElement('span');
        textElement.textContent = ': ' + message.content;
        messageElement.appendChild(textElement);
    } else if (message.type === 'IMAGE') {
        console.log('Creating image element');
        var imgElement = document.createElement('img');
        imgElement.src = message.fileData;
        imgElement.classList.add('file-preview');
        messageElement.appendChild(imgElement);
    } else if (message.type === 'VIDEO') {
        console.log('Creating video element');
        var videoContainer = document.createElement('div');
        videoContainer.classList.add('video-container');

        var videoElement = document.createElement('video');
        videoElement.src = message.fileData;
        videoElement.controls = true;
        videoElement.classList.add('file-preview');

        videoContainer.appendChild(videoElement);
        messageElement.appendChild(videoContainer);
    } else if (message.type === 'AUDIO') {
        console.log('Creating audio element');
        var audioElement = document.createElement('audio');
        audioElement.src = message.fileData;
        audioElement.controls = true;
        audioElement.classList.add('audio-preview');
        messageElement.appendChild(audioElement);
    }

    if (message.fileName) {
        var fileNameElement = document.createElement('div');
        fileNameElement.textContent = 'File: ' + message.fileName;
        messageElement.appendChild(fileNameElement);
    }

    console.log('Appending message element');
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}
usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)