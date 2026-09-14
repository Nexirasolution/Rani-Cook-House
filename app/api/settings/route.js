import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
}

export async function GET() {
  try {
    await connectDB();
    const settings = await getOrCreateSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // The schema's field is "stateShipping" — accept the older
    // "stateShippingRates" name too in case any existing form still sends
    // that, so a save never silently drops the rates.
    const rawRates = Array.isArray(body.stateShipping)
      ? body.stateShipping
      : Array.isArray(body.stateShippingRates)
      ? body.stateShippingRates
      : null;

    if (rawRates) {
      // Clean up: trim names, coerce fees, drop blank rows, and collapse
      // duplicate states (last one wins) so lookups stay unambiguous.
      const byState = new Map();
      for (const row of rawRates) {
        const state = String(row?.state || "").trim();
        if (!state) continue;
        const fee = Number(row?.fee);
        byState.set(state.toLowerCase(), { state, fee: Number.isFinite(fee) ? fee : 0 });
      }
      body.stateShipping = Array.from(byState.values());
    }
    delete body.stateShippingRates;

    let settings = await Settings.findOne();
    if (settings) {
      Object.assign(settings, body);
      await settings.save();
    } else {
      settings = await Settings.create(body);
    }
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}