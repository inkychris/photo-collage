import logging
import os
import pathlib
import random

import fastapi
from fastapi.logger import logger
import jinja2

gunicorn_logger = logging.getLogger('gunicorn.error')
logger.handlers = gunicorn_logger.handlers
if __name__ != "main":
    logger.setLevel(gunicorn_logger.level)
else:
    logger.setLevel(logging.DEBUG)


class ImagePathGenerator:
    def __init__(self, directory: pathlib.Path):
        self.directory = directory
        self._images = []
        self._collect()

    def _collect(self):
        self._images = [
            file.relative_to(self.directory).as_posix()
            for file in self.directory.rglob('*')
            if file.suffix.lower() in ('.png', '.jpg', '.jpeg')
        ]
        random.shuffle(self._images)
        logger.debug((
            f'images[{len(self._images)}]: '
            f'[{self._images[0]}, ..., {self._images[-1]}]'
        ))

    def __next__(self) -> str:
        try:
            return self._images.pop()
        except IndexError:
            self._collect()
            return self._images.pop()


app = fastapi.FastAPI()
image_dir = pathlib.Path(os.environ['COLLAGE_IMAGE_DIR'])
image_path_generator = ImagePathGenerator(image_dir)
index_template = jinja2.Template(
    pathlib.Path('/backend/templates/index.html').read_text())


@app.get('/next')
async def next_url_src():
    return {'src': f'image/{next(image_path_generator)}'}


@app.get('/', response_class=fastapi.responses.HTMLResponse)
async def index(interval: float = 5):
    return index_template.render(collage_interval=interval)
