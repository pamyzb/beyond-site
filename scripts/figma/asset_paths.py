"""Shared destinations for exported artwork, also consumed by the site."""
import json
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[2]
ASSET_PATHS = json.loads((PROJECT / 'src/data/asset-paths.json').read_text(encoding='utf8'))


def asset_path(filename):
    destination = PROJECT / 'public' / ASSET_PATHS[filename]
    destination.parent.mkdir(parents=True, exist_ok=True)
    return destination
