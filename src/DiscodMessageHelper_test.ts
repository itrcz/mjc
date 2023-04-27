import { assertEquals, assertExists } from "https://deno.land/std@0.184.0/testing/asserts.ts";
import { extractPrompt } from "./DiscodMessageHelper.ts";

Deno.test(function ParseMidJourneyVariationsFast() {
    const p1 = extractPrompt("**drawing of an office id badge design template colorful --v 5** - Variations by <@1097074882203303911> (fast)");
    assertExists(p1);
    assertEquals(p1.prompt, "drawing of an office id badge design template colorful --v 5");
    assertEquals(p1.id, "1097074882203303911");
    assertEquals(p1.completion, 1);
    assertEquals(p1.type, "variations");
    assertEquals(p1.mode, "fast");
  });
  
  Deno.test(function ParseMidJourneyDoneRelaxed() {
    const p1 = extractPrompt("**a view of Paris drawn by Kanagawa --v 5** - <@1097074882203303911> (Open on website for full quality) (relaxed)");
    assertExists(p1);
    assertEquals(p1.prompt, "a view of Paris drawn by Kanagawa --v 5");
    assertEquals(p1.id, "1097074882203303911");
    assertEquals(p1.completion, 1);
    assertEquals(p1.type, "grid");
    assertEquals(p1.mode, "relaxed");
  });
  
  Deno.test(function ParseMidJourneyDoneRelaxed2() {
    const p1 = extractPrompt("**ice creams, pinkcore, organic shapes --v 5** - <@1097074882203303911> (relaxed)");
    assertExists(p1);
    assertEquals(p1.prompt, "ice creams, pinkcore, organic shapes --v 5");
    assertEquals(p1.id, "1097074882203303911");
    // assertEquals(p1.completion, 1);
    // assertEquals(p1.type, "grid");
    assertEquals(p1.mode, "relaxed");
  });
  