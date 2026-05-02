// Combined object catalog. Imports each category's builder map and produces
// a single ordered array of `{ name, build }` records consumed by the picker.
//
// Order here = order in the tray grid. Keep related categories adjacent so
// scanning the catalog feels intentional.
import { builders as fruits }     from "./fruits.js";
import { builders as veggies }    from "./veggies.js";
import { builders as food }       from "./food.js";
import { builders as drinks }     from "./drinks.js";
import { builders as shapes }     from "./shapes.js";
import { builders as characters } from "./characters.js";
import { builders as vehicles }   from "./vehicles.js";
import { builders as space }      from "./space.js";
import { builders as nature }     from "./nature.js";
import { builders as tools }      from "./tools.js";
import { builders as weapons }    from "./weapons.js";
import { builders as sports }     from "./sports.js";
import { builders as tableware }  from "./tableware.js";
import { builders as tech }       from "./tech.js";
import { builders as misc }       from "./misc.js";
import { builders as numbers }    from "./numbers.js";

const ALL = {
  ...fruits,
  ...veggies,
  ...food,
  ...drinks,
  ...shapes,
  ...characters,
  ...vehicles,
  ...space,
  ...nature,
  ...tools,
  ...weapons,
  ...sports,
  ...tableware,
  ...tech,
  ...misc,
  ...numbers,
};

export const OBJECTS = Object.entries(ALL).map(([name, build]) => ({ name, build }));

// Convenience: same data grouped by category, for any future "filter by
// category" UI that wants to render section headers.
export const CATEGORIES = {
  fruits, veggies, food, drinks, shapes, characters, vehicles, space, nature,
  tools, weapons, sports, tableware, tech, misc, numbers,
};
