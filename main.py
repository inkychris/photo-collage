import os
import pathlib
import random

import fastapi
import fastapi.responses
import fastapi.staticfiles

image_dir = pathlib.Path(os.environ['COLLAGE_IMAGE_DIR'])
images = list(image_dir.glob('**/*.jpg'))
random.shuffle(images)


class ImagePathGenerator:
    def __init__(self, directory):
        self.directory = directory
        self.images = list(self.directory.glob('**/*.jpg'))
        random.shuffle(images)
        self.index = 0

    def next(self) -> int:
        self.index += 1
        if self.index == len(self.images):
            random.shuffle(images)
            self.index = 0
        return self.index

    def path(self, index) -> pathlib.Path:
        return self.images[index]

    def index_of(self, path) -> int:
        return self.images.index(path)


app = fastapi.FastAPI()
app.mount('/static', fastapi.staticfiles.StaticFiles(directory='static'))


project_dir = pathlib.Path(__file__).absolute().parent
index_file = project_dir / 'index.html'
frame_js_file = project_dir / 'frame.js'


@app.get('/', response_class=fastapi.responses.HTMLResponse)
async def home():
    return index_file.read_text()


@app.get('/frame.js')
async def frame_js():
    return frame_js_file.read_text()


image_path_generator = ImagePathGenerator(image_dir)


@app.get('/next')
async def next_url_src():
    return {'src': f'images/{image_path_generator.next()}'}


@app.get('/images/{image_id}')
async def image(image_id: int):
    image = image_path_generator.path(image_id)
    return fastapi.responses.FileResponse(image)
