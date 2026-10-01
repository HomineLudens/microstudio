// Static table describing each project asset category (sources, sprites,
// maps, sounds, music, assets): storage folder name, accepted file
// extensions, and the project property name they populate.
// Plain Node CommonJS module (not part of the browser concatenation
// bundles — required directly via server/session/projectmanager.coffee).
interface FileTypeDescriptor {
  folder: string;
  extensions: string[];
  property: string;
}

interface FileTypes {
  ms: FileTypeDescriptor;
  sprites: FileTypeDescriptor;
  maps: FileTypeDescriptor;
  sounds: FileTypeDescriptor;
  music: FileTypeDescriptor;
  assets: FileTypeDescriptor;
}

const FILE_TYPES: FileTypes = {
  ms: {
    folder: "ms",
    extensions: ["ms"],
    property: "sources",
  },
  sprites: {
    folder: "sprites",
    extensions: ["png"],
    property: "sprites",
  },
  maps: {
    folder: "maps",
    extensions: ["json"],
    property: "maps",
  },
  sounds: {
    folder: "sounds",
    extensions: ["wav"],
    property: "sounds",
  },
  music: {
    folder: "music",
    extensions: ["mp3"],
    property: "music",
  },
  assets: {
    folder: "assets",
    extensions: ["glb", "jpg", "png"],
    property: "assets",
  },
};

export = FILE_TYPES;
