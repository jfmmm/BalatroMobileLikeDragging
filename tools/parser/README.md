@TODO finish this doc up. Fell free to ask for help about this on discord!

We use the weird `--[=[` lua multiline comment syntax to avoid explosion with the
mere contact with the `[[` syntax of the toml. Having to escape everything would suck.
You then add the `>` to the end so we can tell we should parse this as a toml patch.
It form a sort of arrow that I think match the lovery/love2d theme, think cupid's arrows.

Anything in a comment block like this is parsed as a toml patch and will be exported to
the final lovely toml patch files exported.

The payload is a special field. You can put a normal string payload or you can put a
VSCode style start/end location pairs, made of a line and a column.
Those will extract the matching code relative to the position of the first line after the
current patch comment.

Here is the information we want, but that would be too verbose..
`{ start: { line: 1, column: 3 }, end: { line: 1, column: 30 } }`
We shorten it to just the pair separted by `;`. eg: `1:1;1:30`
`1:1;1:30` would give you the 30 first characters of the first line after the comment.

You can omit the column to select the full line.
eg:
`1:2` would give you the first and second line after the comment.
`1;3:10` You can mix and match.. this capture from line 1 to the 10th character of line 3.

Here a simple patch example.

```
--[=[>
# Here we are adding a new function to the Card class.
# You can put toml comments but they won't currently make it to the final toml patch sadly.
# @TODO Find a better toml parser module.
[[patches]]
[patches.pattern]
target = "card.lua"
pattern = "function Card:save()"
position = "before"
payload = "1;7"
match_indent = true
times = 1
]=]
function Card:can_long_press()
  if self.area and ((self.area == G.hand) or
  ( self.area == G.deck and self.area.cards[1] == self)) then
      return true
  end
end
```


The payload can also be a mix of a normal payload augmented with JS Style template literals.
Eg: `${1:2}`
Those get replaced by the code at the provided location.

This is usefull with regex and named capture group. You can mix both the `$name` capture group
and insert code from the source using the ${} templates.

```
--[=[>
# Here we use a regex to make sure we are in the right function then find the line we want to wrap with a condition.
# The regex captured all the code before our target line. So in the payload we put our $before and
# Then we use the template literals to pick the 3 lines from our source code that
# we want to replace/wrap the `card:highlight(false)` line with.
[[patches]]
[patches.regex]
target = "cardarea.lua"
pattern = '(?<before>function CardArea:remove_from_highlighted[\s\S]+)(?:    card:highlight\(false\))'
position = "at"
payload = '''
$before
${3;5}
'''
times = 1
]=]
function CardArea:remove_from_highlighted(card, force)
  if (not force) and  card and card.ability.forced_selection and self == G.hand then return end
  if card then
      card:highlight(false)
  end
  if self == G.hand and G.STATE == G.STATES.SELECTING_HAND then
      self:parse_highlighted()
  end
end
```
