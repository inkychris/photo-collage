function random_hsl() {
    return 'hsla(' + (Math.random() * 360) + ', 100%, 50%, 1)';
}

class Frame {
    aspect_ratio = 3 / 4
    fade_in_time = 5
    fade_out_time = 10

    constructor(scale) {
        this.scale = scale

        this.x_rand = Math.random()
        this.y_rand = Math.random()

        this.container = document.createElement("div")
        this.container.classList.add("frame")
        this.container.style.position = "absolute"
        this.container.style.backgroundColor = random_hsl()
        this.container.style.opacity = 0
        this.update()
    }

    update() {
        var pixel_height = window.innerHeight * this.scale / 100
        var pixel_width = pixel_height / this.aspect_ratio

        if (100 * pixel_width / window.innerWidth > this.scale) {
            pixel_width = window.innerWidth * this.scale / 100
            pixel_height = pixel_width * this.aspect_ratio
        }

        this.container.style.left = `${this.x_rand * (window.innerWidth - pixel_width)}px`
        this.container.style.top = `${this.y_rand * (window.innerHeight - pixel_height)}px`
        this.container.style.width = `${pixel_width}px`
        this.container.style.height = `${pixel_height}px`
    }

    fade_in() {
        this.container.style.animation = `fade_in ${this.fade_in_time}s forwards`
    }

    fade_out() {
        this.container.style.animation = `fade_out ${this.fade_out_time}s forwards`
    }

    add_to_body() {
        document.body.appendChild(this.container)
    }

    remove_from_body() {
        document.body.removeChild(this.container)
    }
}
