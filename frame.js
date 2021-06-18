function random_hsl() {
    return 'hsla(' + (Math.random() * 360) + ', 100%, 50%, 1)';
}

class Collage {
    constructor() {
        this.aspect_ratio = 4/3
        this.scale = 0.37

        this.fade_in_time = 5
        this.fade_out_delay = 10
        this.fade_out_time = 10

        this.max_frames_to_avoid = 5
        this.active_frames = []
    }

    update() {
        this.active_frames.forEach(frame => frame.update())
    }

    new_frame() {
        let frame = new Frame({x: Math.random(), y: Math.random()}, this.scale, this.aspect_ratio)
        let total_attempts = 0
        for (let frames_to_avoid = this.max_frames_to_avoid; frames_to_avoid >= 0; frames_to_avoid--) {
            let previous_frames = this.active_frames.slice(-frames_to_avoid)
            for (let attempts = 0; attempts < 50; attempts++) {
                total_attempts++;
                frame.position.x = Math.random()
                frame.position.y = Math.random()
                frame.update()
                if (!previous_frames.some(previous_frame => previous_frame.overlaps(frame))) {
                    return frame
                }
            }
        }
    }

    insert_new_frame() {
        let frame = this.new_frame()
        this.active_frames.push(frame)
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
}

class Frame {
    constructor(position, scale, aspect_ratio) {
        this.position = position
        this.scale = scale
        this.aspect_ratio = aspect_ratio

        this.container = document.createElement("div")
        this.container.classList.add("frame")
        this.container.style.position = "absolute"
        this.container.style.backgroundColor = random_hsl()
        this.container.style.opacity = "0"
        this.update()
    }

    update() {
        this.pixel_height = window.innerHeight * this.scale
        this.pixel_width = this.pixel_height * this.aspect_ratio

        if (this.pixel_width / window.innerWidth > this.scale) {
            this.pixel_width = window.innerWidth * this.scale
            this.pixel_height = this.pixel_width / this.aspect_ratio
        }

        this.pixel_left = this.position.x * (window.innerWidth - this.pixel_width)
        this.pixel_top = this.position.y * (window.innerHeight - this.pixel_height)

        this.container.style.left = `${this.pixel_left}px`
        this.container.style.top = `${this.pixel_top}px`
        this.container.style.width = `${this.pixel_width}px`
        this.container.style.height = `${this.pixel_height}px`
    }

    contains_coordinate(coordinate) {
        let within_horizontal = coordinate.x >= this.pixel_left && coordinate.x <= this.pixel_left + this.pixel_width
        let within_vertical = coordinate.y >= this.pixel_top && coordinate.y <= this.pixel_top + this.pixel_height
        return within_horizontal && within_vertical
    }

    get corners() {
        return [
            {x: this.pixel_left, y: this.pixel_top},
            {x: this.pixel_left + this.pixel_width, y: this.pixel_top},
            {x: this.pixel_left, y: this.pixel_top + this.pixel_height},
            {x: this.pixel_left + this.pixel_width, y: this.pixel_top + this.pixel_height},
        ]
    }

    overlaps(other_frame) {
        return this.corners.some(corner => other_frame.contains_coordinate(corner))
    }

    populate_with_image(src) {
        let image = document.createElement("img")
        image.src = src
        this.container.appendChild(image)
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
