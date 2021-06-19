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
        this.aspect_ratio = 1
        this.scale = 0.35
        this.scale_range = 0.1

        this.fade_in_time = 3
        this.fade_out_delay = 10
        this.fade_out_time = 40

        this.positions = positions(16, 16)
        this.active_frames = []

        this.counter = 1
    }

    update() {
        this.active_frames.forEach(frame => frame.update())
    }

    new_frame() {
        let global_frame_index = this.counter++
        let scale = this.scale + (Math.random() - 0.5) * this.scale_range

        let potential_frames =  shuffle(this.positions).map(pos =>
            new Frame(pos, scale, this.aspect_ratio, global_frame_index))

        if (this.active_frames.length < 1)
            return potential_frames[0]

        let overlap_weightings = potential_frames.map(potential_frame =>
            this.active_frames.reduce((sum, frame_to_avoid) =>
                sum + potential_frame.overlap(frame_to_avoid) / (potential_frame.index - frame_to_avoid.index)
            , 0))

        let min_overlap_weighting = Math.min(...overlap_weightings)
        let frame_index = overlap_weightings.indexOf(min_overlap_weighting)
        console.log(`found position with ${min_overlap_weighting} overlap weighting, frame index ${frame_index}`)
        return potential_frames[frame_index]
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
    constructor(position, scale, aspect_ratio, index) {
        this.index = index

        this.position = position
        this.scale = scale
        this.aspect_ratio = aspect_ratio

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

    get bounds() {
        return {
            left: this.pixel_left,
            right: this.pixel_left + this.pixel_width,
            top: this.pixel_top,
            bottom: this.pixel_top + this.pixel_height,
        }
    }

    overlap(other_frame) {
        let self = this.bounds
        let other = other_frame.bounds
        let x_overlap = Math.max(0, Math.min(self.right, other.right) - Math.max(self.left, other.left));
        let y_overlap = Math.max(0, Math.min(self.bottom, other.bottom) - Math.max(self.top, other.top));
        return x_overlap * y_overlap;
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
