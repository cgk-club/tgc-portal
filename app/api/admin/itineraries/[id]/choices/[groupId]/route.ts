export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // If updating an option
    if (body._action === "add_option") {
      const { _action, ...optionData } = body;
      const { data, error } = await supabase
        .from("choice_options")
        .insert({ ...optionData, group_id: groupId })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }

    if (body._action === "update_option") {
      const { _action, optionId, ...fields } = body;
      const { data, error } = await supabase
        .from("choice_options")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", optionId)
        .eq("group_id", groupId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (body._action === "delete_option") {
      const { error } = await supabase
        .from("choice_options")
        .delete()
        .eq("id", body.optionId)
        .eq("group_id", groupId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (body._action === "select_option") {
      // Deselect all options in this group first
      await supabase
        .from("choice_options")
        .update({ is_selected: false })
        .eq("group_id", groupId);

      // Select the chosen one
      if (body.optionId) {
        await supabase
          .from("choice_options")
          .update({ is_selected: true })
          .eq("id", body.optionId)
          .eq("group_id", groupId);
      }

      // Update group status
      await supabase
        .from("choice_groups")
        .update({ status: body.optionId ? "decided" : "open", updated_at: new Date().toISOString() })
        .eq("id", groupId);

      return NextResponse.json({ success: true });
    }

    // Default: update the group itself
    const { data, error } = await supabase
      .from("choice_groups")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", groupId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Choice group update error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("choice_groups").delete().eq("id", groupId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Choice group delete error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
