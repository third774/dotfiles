import { To, KeyCode, Manipulator, KarabinerRules } from "./types";

/**
 * Custom way to describe a command in a layer
 */
export interface LayerCommand {
  to: To[];
  description?: string;
}

type LeaderKeySublayer = {
  // The ? is necessary, otherwise we'd have to define something for _every_ key code
  [key_code in KeyCode]?: LayerCommand;
};

/**
 * Create a Leader Key sublayer, where every command is prefixed with a key
 * e.g. Leader + O ("Open") is the "open applications" layer, I can press
 * e.g. Leader + O + G ("Google Chrome") to open Chrome
 */
export function createLeaderSubLayer(
  sublayer_key: KeyCode,
  commands: LeaderKeySublayer,
  allSubLayerVariables: string[]
): Manipulator[] {
  const subLayerVariableName = generateSubLayerVariableName(sublayer_key);

  return [
    // When Leader + sublayer_key is pressed, set the variable to 1; on key_up, set it to 0 again
    {
      description: `Enable Leader sublayer ${sublayer_key}`,
      type: "basic",
      from: {
        key_code: sublayer_key,
        modifiers: {
          optional: ["any"],
        },
      },
      to: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 1,
          },
        },
        {
          set_variable: {
            name: "leader",
            value: 0,
          },
        },
      ],
      // This enables us to press other sublayer keys in the current sublayer
      // (e.g. Leader + O > M even though Leader + M is also a sublayer)
      // basically, only trigger a sublayer if no other sublayer is active
      conditions: [
        ...allSubLayerVariables
          .filter(
            (subLayerVariable) => subLayerVariable !== subLayerVariableName
          )
          .map((subLayerVariable) => ({
            type: "variable_if" as const,
            name: subLayerVariable,
            value: 0,
          })),
        {
          type: "variable_if",
          name: "leader",
          value: 1,
        },
      ],
    },
    {
      description: `Disable Leader sublayer ${sublayer_key}`,
      type: "basic",
      from: {
        key_code: "escape",
        modifiers: {
          optional: ["any"],
        },
      },
      to: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 0,
          },
        },
      ],
      conditions: [
        {
          type: "variable_if",
          name: subLayerVariableName,
          value: 1,
        },
      ],
    },
    // Define the individual commands that are meant to trigger in the sublayer
    ...(Object.keys(commands) as (keyof typeof commands)[]).map(
      (command_key): Manipulator => {
        const command = commands[command_key];
        if (!command) {
          throw new Error(`No command defined for ${command_key}`);
        }
        return {
          ...command,
          to: [
            ...command.to,
            {
              set_variable: {
                name: subLayerVariableName,
                value: 0,
              },
            },
            {
              set_variable: {
                name: "leader",
                value: 0,
              },
            },
          ],
          type: "basic" as const,
          from: {
            key_code: command_key,
            modifiers: {
              optional: ["any"],
            },
          },
          // Only trigger this command if the variable is 1 (i.e., if Leader + sublayer is held)
          conditions: [
            {
              type: "variable_if",
              name: subLayerVariableName,
              value: 1,
            },
          ],
        };
      }
    ),
  ];
}

/**
 * Create all leader sublayers. This needs to be a single function, as well need to
 * have all the leader variable names in order to filter them and make sure only one
 * activates at a time
 */
export function createLeaderSubLayers(subLayers: {
  [key_code in KeyCode]?: LeaderKeySublayer | LayerCommand;
}): KarabinerRules[] {
  const allSubLayerVariables = (
    Object.keys(subLayers) as (keyof typeof subLayers)[]
  ).map((sublayer_key) => generateSubLayerVariableName(sublayer_key));

  return Object.entries(subLayers).map(([key, command]) => {
    return "to" in command
      ? {
          description: `Leader Key + ${key}`,
          manipulators: [
            {
              ...command,
              to: [
                ...command.to,
                {
                  set_variable: {
                    name: "leader",
                    value: 0,
                  },
                },
              ],
              type: "basic" as const,
              from: {
                key_code: key as KeyCode,
                modifiers: {
                  optional: ["any"],
                },
              },
              conditions: [
                {
                  type: "variable_if",
                  name: "leader",
                  value: 1,
                },
              ],
            },
          ],
        }
      : {
          description: `Leader Key sublayer "${key}"`,
          manipulators: createLeaderSubLayer(
            key as KeyCode,
            command,
            allSubLayerVariables
          ),
        };
  });
}

function generateSubLayerVariableName(key: KeyCode) {
  return `leader_sublayer_${key}`;
}

/**
 * Shortcut for "open" shell command
 */
export function shell(what: string, description?: string): LayerCommand {
  return {
    to: [
      {
        shell_command: what,
      },
    ],
    description: description || `Run shell command: ${what}`,
  };
}

/**
 * Shortcut for "open" shell command
 */
export function open(what: string): LayerCommand {
  return shell(`open ${what}`, `Open ${what}`);
}

/**
 * Shortcut for "open" shell command in background
 */
export function bgOpen(what: string): LayerCommand {
  return shell(`open -g ${what}`, `Open ${what} in background`);
}

/**
 * Shortcut for "Open an app" command (of which there are a bunch)
 */
export function app(name: string): LayerCommand {
  return open(`-a '${name}.app'`);
}
