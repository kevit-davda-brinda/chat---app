const client_socket = io()

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//tamplates
const $messageTamplate = document.querySelector('#message-tamplate').innerHTML;
const $locationMessageTamplate = document.querySelector('#location-message-tamplate').innerHTML;
const $slideBarTamplate = document.querySelector('#slidebar-template').innerHTML;


//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//auto scrolling
const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    //Height of new messages
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of massage container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if((containerHeight - newMessageHeight) <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

client_socket.on('message', (message) => {
    console.log(message);

    if (message.text.length != 0) {
        const html = Mustache.render($messageTamplate, { username: message.username, message: message.text, createdAt: moment(message.createdAt).format('LT') });
        $messages.insertAdjacentHTML('beforeend', html)

        console.log(username);
        autoScroll();
    }

})

client_socket.on('locationMessage', (message) => {
    console.log(message);

    const html = Mustache.render($locationMessageTamplate, { username: message.userName, url: message.url, createdAt: moment(message.createdAt).format('LT') });
    $messages.insertAdjacentHTML('beforeend', html)

    console.log(username);
    autoScroll();
});

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.name.value;

    client_socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            alert(error);
            location.href = "/"
        }

        console.log('Message is delivered!');
    });
});

$sendLocationButton.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('Geo Location is not supported')
    }

    $sendLocationButton.setAttribute('disable', 'disabled');


    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)

        client_socket.emit('sendLocation', { lat: position.coords.latitude, long: position.coords.longitude }, () => {

            $sendLocationButton.removeAttribute('disable');
            console.log('Location Shared');
        })
    })
})

client_socket.emit('join', ({ username, room }), (error) => {
    if (error) {
        alert(error);
        location.href = "/"
    }

});

client_socket.on('roomData', ({ room, users }) => {
    console.log(room);
    console.log(users);

    const html = Mustache.render($slideBarTamplate, { room, users });

    document.querySelector('#slidbar').innerHTML = html;
})
