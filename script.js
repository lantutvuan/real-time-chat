const socket = io('http://localhost:3000')

const chatContainer = document.querySelector('[data-chat-container]')
const messagesContainer = document.querySelector('[data-messages-container]')
const input = document.querySelector('[data-input]')
const inputFile = document.querySelector('[data-images]')

const name = prompt("What is your name?") || 'Anonymous'

addMessage("You joined the chat")
socket.emit('new-user', name)

socket.on('chat-image', image => {
    addImage(image);
})

socket.on('chat-message', message => {
    addMessage(`${message.name}: ${message.message}`)
})

socket.on('user-connected', name => {
    addMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
    addMessage(`${name} disconnected`)
})

inputFile.onchange = e => {
    console.log("change", e.target.files[0].name)
    input.placeholder = e.target.files[0].name;
}

chatContainer.addEventListener('submit', e => {
    e.preventDefault()

    const text = input.value
    const image = inputFile.files[0]

    if (text) {
        addMessage(`You: ${text}`)
        socket.emit('send-chat-message', text)
    } else if (image) {
        console.log('image client', image)
        addImage(image)
        socket.emit('send-chat-image', image) 
    }

    inputFile.value = '';
    input.value = '';
    input.placeholder = '';
})

function addImage (image) {
    const imageElement = document.createElement('img')
    imageElement.classList.add('image')

    const binaryData = []; // using Blob cause url.createObjectURL() when passing to server converts to Array Buffer
    binaryData.push(image);
    imageElement.src = URL.createObjectURL(new Blob(binaryData, {type: "application/zip"}))

    messagesContainer.appendChild(imageElement)
}

function addMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.classList.add('message')
    messageElement.innerHTML = message
    messagesContainer.appendChild(messageElement)
}

// Drag and drop

messagesContainer.addEventListener('dragover', (event) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = 'move';
})

messagesContainer.addEventListener('drop', (event) => {
    event.preventDefault();

    const fileList = event.dataTransfer.files;
    const image = fileList
    inputFile.files = fileList;

    input.placeholder = inputFile.files[0].name;
 });