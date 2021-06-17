function random_hsl() {
    return 'hsla(' + (Math.random() * 360) + ', 100%, 50%, 1)';
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

        this.container.style.left = `${this.position.x * (window.innerWidth - this.pixel_width)}px`
        this.container.style.top = `${this.position.y * (window.innerHeight - this.pixel_height)}px`
        this.container.style.width = `${this.pixel_width}px`
        this.container.style.height = `${this.pixel_height}px`
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
