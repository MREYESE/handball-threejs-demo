import type { Vec2 } from "../math";

/** Gravity-oriented geometry, independent of lateral endpoint aim and timing. */
export function verticalTurn(points: readonly Vec2[]) {
  const start = points[0], end = points.at(-1);
  if (!start || !end) return { hook:false, vee:false, descent:0 };
  let apex=start.y, valley=start.y, upward=0, downward=0;
  for(let i=1;i<points.length;i++) {
    const y=points[i]!.y, previous=points[i-1]!.y;
    apex=Math.min(apex,y); valley=Math.max(valley,y);
    upward+=Math.max(0,previous-y); downward+=Math.max(0,y-previous);
  }
  const rise=start.y-apex, retrace=end.y-apex;
  const descent=valley-start.y, ascent=valley-end.y;
  return {
    hook:rise>0.16 && retrace>0.045 && retrace<rise*0.65 && start.y-end.y>0.065 &&
      upward<rise*1.18 && downward<retrace*1.18,
    // Unlike LOB, V does not require net upward progress: its low endpoint
    // can independently aim low, including returning to the starting height.
    vee:descent>0.07 && ascent>0.12 && downward<descent*1.18 && upward<ascent*1.18,
    descent,
  };
}
