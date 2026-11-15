# Source models

The uncompressed originals of the 3D models in `public/models/`. They aren't deployed.

The deployed copies are meshopt-compressed (about 4× smaller, with every mesh and node name
kept, which the amenities viewer relies on). After changing a model here, write the deployed
copy with:

```bash
npx gltf-transform meshopt tools/source-models/macquarie-park-building.glb public/models/macquarie-park-building.glb
```

Don't use `gltf-transform optimize`: it joins meshes, and the viewer finds amenities by mesh name.
