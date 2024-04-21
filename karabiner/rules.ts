import fs from "fs";
import { KarabinerRules } from "./types";
import { app, bgOpen, createLeaderSubLayers, open, shell } from "./utils";

const rules: KarabinerRules[] = [
  {
    description: "Change right_command+jkli to arrow keys",
    manipulators: [
      {
        from: {
          key_code: "j",
          modifiers: {
            mandatory: ["right_command"],
            optional: ["any"],
          },
        },
        to: [
          {
            key_code: "left_arrow",
          },
        ],
        type: "basic",
      },
      {
        from: {
          key_code: "k",
          modifiers: {
            mandatory: ["right_command"],
            optional: ["any"],
          },
        },
        to: [
          {
            key_code: "down_arrow",
          },
        ],
        type: "basic",
      },
      {
        from: {
          key_code: "i",
          modifiers: {
            mandatory: ["right_command"],
            optional: ["any"],
          },
        },
        to: [
          {
            key_code: "up_arrow",
          },
        ],
        type: "basic",
      },
      {
        from: {
          key_code: "l",
          modifiers: {
            mandatory: ["right_command"],
            optional: ["any"],
          },
        },
        to: [
          {
            key_code: "right_arrow",
          },
        ],
        type: "basic",
      },
    ],
  },
  {
    description: "Change Caps Lock to Meh when held",
    manipulators: [
      {
        from: {
          key_code: "caps_lock",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            key_code: "left_shift",
            modifiers: ["left_control", "left_option"],
          },
        ],
        type: "basic",
      },
    ],
  },

  // Define the Leader key itself
  {
    description: "Activate Leader Key",
    manipulators: [
      {
        description: "Meh Space -> Activate Leader Key",
        from: {
          key_code: "spacebar",
          modifiers: {
            mandatory: ["left_shift", "left_control", "left_option"],
          },
        },
        to: [
          {
            set_variable: {
              name: "leader",
              value: 1,
            },
          },
        ],
        conditions: [
          {
            type: "variable_if",
            name: "leader",
            value: 0,
          },
        ],
        type: "basic",
      },
    ],
  },
  {
    description: "Deactivate Leader Key (⌃⌥⇧⌘)",
    manipulators: [
      {
        description: "Caps Lock -> Deactivate Leader Key",
        from: {
          key_code: "caps_lock",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "leader",
              value: 0,
            },
          },
        ],
        conditions: [
          {
            type: "variable_if",
            name: "leader",
            value: 1,
          },
        ],
        type: "basic",
      },
      {
        description: "Escape -> Deactivate Leader Key",
        from: {
          key_code: "escape",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "leader",
              value: 0,
            },
          },
        ],
        conditions: [
          {
            type: "variable_if",
            name: "leader",
            value: 1,
          },
        ],
        type: "basic",
      },
    ],
  },
  ...createLeaderSubLayers({
    // s = "Search"
    s: {
      1: open("raycast://extensions/khasbilegt/1password/item-list"),
      s: open("raycast://extensions/mattisssa/spotify-player/search"),
      o: open("raycast://extensions/KevinBatdorf/obsidian/searchNoteCommand"),
      a: open("raycast://extensions/the-browser-company/arc/search"),
      b: open("raycast://extensions/nhojb/brew/search"),
      // A"m"azon
      m: open("raycast://extensions/xilopaint/amazon-search/index"),
    },

    // b = "B"rowse
    b: {},

    // u = "Utilities"
    u: {
      // zoom
      z: {
        to: [{ key_code: "8", modifiers: ["left_command", "left_option"] }],
      },
      // voiceover
      v: {
        to: [{ key_code: "f5", modifiers: ["left_command"] }],
      },
      // toggle dark mode
      d: bgOpen("raycast://extensions/raycast/system/toggle-system-appearance"),
      // text to speech
      t: {
        to: [{ consumer_key_code: "dictation" }],
      },
      s: {
        to: [
          {
            key_code: "4",
            modifiers: ["left_command", "left_control", "left_shift"],
          },
        ],
      },
    },

    // w = "Window"
    w: {
      i: bgOpen(
        "raycast://extensions/raycast/window-management/top-right-quarter"
      ),
      u: bgOpen(
        "raycast://extensions/raycast/window-management/top-left-quarter"
      ),
      k: bgOpen(
        "raycast://extensions/raycast/window-management/bottom-right-quarter"
      ),
      j: bgOpen(
        "raycast://extensions/raycast/window-management/bottom-left-quarter"
      ),
      return_or_enter: bgOpen(
        "raycast://extensions/raycast/window-management/maximize"
      ),
      delete_or_backspace: bgOpen(
        "raycast://extensions/raycast/window-management/restore"
      ),
    },
    spacebar: bgOpen("raycast://extensions/raycast/raycast/confetti"),

    // Media
    m: {
      p: {
        to: [{ key_code: "play_or_pause" }],
      },
      n: {
        to: [{ key_code: "fastforward" }],
      },
      b: {
        to: [{ key_code: "rewind" }],
      },
      1: shell(`osascript -e "set volume output volume 10"`),
      2: shell(`osascript -e "set volume output volume 20"`),
      3: shell(`osascript -e "set volume output volume 30"`),
      4: shell(`osascript -e "set volume output volume 40"`),
      5: shell(`osascript -e "set volume output volume 50"`),
      6: shell(`osascript -e "set volume output volume 60"`),
      7: shell(`osascript -e "set volume output volume 70"`),
      8: shell(`osascript -e "set volume output volume 80"`),
      9: shell(`osascript -e "set volume output volume 90"`),
      0: shell(`osascript -e "set volume output volume 100"`),
    },

    // r = "Raycast"
    r: {
      n: open("raycast://script-commands/dismiss-notifications"),
      c: open("raycast://extensions/raycast/system/open-camera"),
      a: open("raycast://extensions/raycast/raycast-ai/ai-chat"),
      e: open("raycast://extensions/raycast/raycast-settings/extensions"),
    },
  }),
];

fs.writeFileSync(
  "karabiner.json",
  JSON.stringify(
    {
      global: {
        show_in_menu_bar: false,
      },
      profiles: [
        {
          name: "Default",
          complex_modifications: {
            rules,
          },
        },
      ],
    },
    null,
    2
  )
);
