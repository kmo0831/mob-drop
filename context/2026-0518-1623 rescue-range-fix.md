# Report 2: Rescue Range Fix

- Created: 5/18/2026 16:23

## Purpose

This report documents the rescue interaction issue identified during testing, the changes made to address it, and the outcome after validation.

## Issue Summary

The villager rescue mechanic allowed keyboard rescue input to be effectively preloaded. A player could press and hold the `E` key before entering rescue range, move into range while still holding the key, and begin rescue progress without making a fresh interaction at the villager.

This behavior weakened the intended interaction rule. Rescue is designed as an active, in-range action, not a passive result of holding a key in advance.

A related presentation issue was also observed: the `[E]` prompt was displayed even when the player was not in range to perform a rescue interaction. This made the on-screen cue less trustworthy because it did not always reflect when `E` would actually be meaningful.

## Intended Behavior

The intended rescue behavior is:
- the player must be within rescue range of a villager
- keyboard rescue should begin only when `E` is pressed while already in range
- holding `E` from outside range should not arm or preload rescue
- leaving range, taking damage, or otherwise breaking rescue conditions should interrupt progress
- the `[E]` prompt should appear only when the player is close enough that pressing `E` is relevant

## Root Cause

The original rescue logic checked whether `E` was currently held rather than whether it had been newly pressed while in range.

Because of that, the interaction condition was effectively:
- player is in range
- `E` is down

That meant the order of actions did not matter. If the key was already being held before entering range, rescue could still start.

The UI prompt issue came from draw logic that showed `[E]` broadly rather than tying the prompt directly to the same range condition used by rescue interaction.

## Implementation Summary

The fix introduced an edge-triggered keyboard interaction model for villager rescue.

### Keyboard rescue activation

A fresh keypress state was added for keyboard input so the game can distinguish between:
- a key that is currently being held
- a key that was newly pressed this frame

Villagers now use that distinction to allow keyboard rescue to begin only when:
- the player is in rescue range
- `E` has just been pressed

Once rescue has validly begun, continuing to hold `E` can maintain progress, but pre-holding the key from outside the interaction zone no longer starts rescue.

### Rescue prompt visibility

Villagers now track whether the player is currently within rescue range, and the `[E]` prompt is drawn only when that condition is true.

This aligns the visual cue with the actual moment when keyboard rescue is contextually relevant.

## Testing Follow-Up

During initial validation after the first implementation, a new issue was discovered:
- the `[E]` prompt correctly appeared only in range
- however, pressing `E` did not start rescue reliably

This was traced to where the fresh keypress state was being cleared.

The first implementation cleared the one-frame `E` press inside each villager’s `update()` call. Because all villagers update every frame, the first villager processed could consume the fresh keypress before the in-range villager evaluated it.

## Follow-Up Fix

The fresh `E` press state was moved to frame-level lifecycle management.

Specifically:
- villagers no longer clear the fresh keypress state themselves
- the fresh `E` press is now cleared once per frame at the end of the main loop

This ensures the input remains available to all villager updates for that frame, allowing the correct villager to detect the new press.

## Files Affected

The rescue fix work touched the following files:
- `js/input.js`
- `js/villager.js`
- `js/game.js`

### `js/input.js`
Added tracking for fresh keypress state so interactions can depend on a new press rather than only a held key.

### `js/villager.js`
Updated rescue logic to:
- require a fresh in-range keyboard activation
- preserve rescue progress only after valid activation
- track in-range status for prompt display
- draw `[E]` only when the player is close enough for keyboard rescue to matter

### `js/game.js`
Updated the frame loop so fresh keyboard press state is cleared once per frame instead of inside individual villager updates.

## Outcome

After the follow-up correction, the rescue mechanic now better matches the intended interaction model:
- rescue cannot be preloaded by holding `E` before approaching a villager
- rescue begins only from an in-range keyboard press
- the `[E]` prompt appears only when the player is in valid rescue range
- fresh keypress handling now persists for the full frame, preventing the input from being consumed by unrelated villager updates

## Design Impact

This change improves both gameplay clarity and interaction consistency.

Benefits include:
- stronger alignment between player intent and game response
- clearer distinction between being near an interactable target and actively interacting with it
- better trust in UI prompts, because `[E]` now appears only when it is useful
- more reliable frame-level input handling for entity interactions

## Notes

This work was intentionally focused on keyboard rescue interaction and rescue prompt accuracy. Touch behavior was not expanded beyond preserving existing functionality.

## Summary

The rescue interaction previously allowed players to hold `E` before entering range and still begin rescue on arrival. The fix introduced fresh-press input handling so rescue must be actively started while in range, then aligned the `[E]` prompt with actual rescue eligibility. A follow-up correction moved fresh keypress clearing to the main frame loop, ensuring the new interaction logic functioned reliably across all villagers.
