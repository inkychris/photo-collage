function random_hsl() {
    return 'hsla(' + (Math.random() * 360) + ', 100%, 50%, 1)';
}

function positions(cols, rows) {
    let result = []
    for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows; row++)
            result.push({x: col / (cols - 1), y: row / (rows - 1)})
    return result
}

function shuffle(array) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

class Collage {
    constructor() {
        this.scale = 0.4
        this.scale_range = 0.1

        this.fade_in_time = 5
        this.fade_out_delay = 5
        this.fade_out_time = 20

        this.positions = positions(16, 16)
        this.active_frames = []

        this.frame_counter = 1
    }

    update() {
        this.active_frames.forEach(frame => frame.update())
    }

    new_frame() {
        let global_frame_index = this.frame_counter++
        let scale = this.scale + (Math.random() - 0.5) * this.scale_range

        let positions = shuffle(this.positions)
        let frame = new Frame(positions[0], scale, global_frame_index)

        let self = this
        positions.forEach(function(position) {
            let previous_position = frame.position
            let previous_overlap_weighting = frame.overlap_weighting(self.active_frames)
            frame.move_to(position)
            if (frame.overlap_weighting(self.active_frames) >= previous_overlap_weighting)
                frame.move_to(previous_position)
        })
        return frame
    }

    insert_new_image(image_src) {
        let frame = this.new_frame()
        this.active_frames.push(frame)

        let image_container = document.createElement("div")
        let image = document.createElement("img")
        image.src = image_src
        image.alt = ""
        image_container.appendChild(image)
        frame.add_element(image_container)

        frame.add_to_body()
        frame.fade_in(this.fade_in_time)

        let instance = this
        setTimeout(function() {
            frame.fade_out(instance.fade_out_time)
        }, instance.fade_out_delay * 1000)
        setTimeout(function() {
            frame.remove_from_body()
            instance.active_frames = instance.active_frames.filter(element => element !== frame)
        }, instance.fade_out_delay * 1000 + (instance.fade_out_time * 1000))
    }

    insert_new_frame() {
        let xhttp = new XMLHttpRequest();
        let self = this
        xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText)
            self.insert_new_image(response.src)
        }
        };
        xhttp.open("GET", "next", true);
        xhttp.send();
    }

    run(display_rate=1) {
        this.insert_new_frame()
        let self = this
        this.interval = setInterval(function() {
            self.insert_new_frame()
        }, display_rate * 1000)
    }

    stop() {
        clearInterval(this.interval)
    }
}

class Frame {
    constructor(position, scale, index) {
        this.index = index

        this.position = position
        this.scale = scale

        this.container = document.createElement("div")
        this.container.classList.add("frame")
        this.container.style.position = "absolute"
        this.container.style.backgroundColor = random_hsl()
        this.container.style.opacity = "0"
        this.update()

        let label = document.createElement("div")
        label.classList.add("frame_index")
        label.textContent = this.index
        this.add_element(label)
    }

    update() {
        this.height = window.innerHeight * this.scale
        this.width = window.innerWidth * this.scale

        this.left = this.position.x * (window.innerWidth - this.width)
        this.right = this.left + this.width
        this.top = this.position.y * (window.innerHeight - this.height)
        this.bottom = this.top + this.height

        this.container.style.left = `${this.left}px`
        this.container.style.top = `${this.top}px`
        this.container.style.width = `${this.width}px`
        this.container.style.height = `${this.height}px`
    }

    move_to(position) {
        this.position = position
        this.update()
    }

    overlap(other) {
        let x_overlap = Math.max(
            0, Math.min(this.right, other.right) - Math.max(this.left, other.left));
        let y_overlap = Math.max(
            0, Math.min(this.bottom, other.bottom) - Math.max(this.top, other.top));
        return x_overlap * y_overlap;
    }

    overlap_weighting(frames) {
        return frames.reduce(
            (sum, frame_to_avoid) => sum + this.overlap(frame_to_avoid) / (this.index - frame_to_avoid.index), 0)
    }

    add_element(element) {
        this.container.appendChild(element)
    }

    fade_in(duration) {
        this.container.style.animationName = "fade_in"
        this.container.style.animationDuration = `${duration}s`
        this.container.style.animationFillMode = "forwards"
        this.container.style.animationDelay = "0.5s"
    }

    fade_out(duration) {
        this.container.style.animationName = "fade_out"
        this.container.style.animationDuration = `${duration}s`
        this.container.style.animationFillMode = "forwards"
        this.container.style.animationDelay = "0s"
    }

    add_to_body() {
        document.body.appendChild(this.container)
    }

    remove_from_body() {
        document.body.removeChild(this.container)
    }
}
