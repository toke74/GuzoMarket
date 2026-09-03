"use client";

import { useState, useTransition } from "react";
import { Archive, CheckCircle2, Trash2 } from "lucide-react";

import { listingLifecycleAction } from "@/features/account/actions";
import type { OwnerListingAction } from "@/server/account/service";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LifecycleControlsProps = {
  listingId: string;
  listingTitle: string;
  actions: OwnerListingAction[];
};

const mutationLabels: Record<string, string> = {
  "mark-sold": "Mark Sold",
  "mark-rented": "Mark Rented",
  "mark-filled": "Mark Filled",
  archive: "Archive",
  delete: "Delete",
};

export function ListingLifecycleControls({ listingId, listingTitle, actions }: LifecycleControlsProps) {
  const [confirming, setConfirming] = useState<OwnerListingAction | null>(null);
  const [isPending, startTransition] = useTransition();
  const mutationActions = actions.filter((action) => action in mutationLabels);

  if (!mutationActions.length) {
    return null;
  }

  const activeLabel = confirming ? mutationLabels[confirming] : "";

  return (
    <>
      {mutationActions.map((action) => (
        <Button
          key={action}
          type="button"
          variant={action === "delete" ? "destructive" : "outline"}
          size="sm"
          onClick={() => setConfirming(action)}
        >
          {action === "archive" ? <Archive className="h-4 w-4" aria-hidden="true" /> : null}
          {action === "delete" ? <Trash2 className="h-4 w-4" aria-hidden="true" /> : null}
          {action.startsWith("mark-") ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
          {mutationLabels[action]}
        </Button>
      ))}

      <Dialog open={Boolean(confirming)} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeLabel}?</DialogTitle>
            <DialogDescription>
              This changes the lifecycle state for {listingTitle}. The server will verify ownership and reject invalid transitions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setConfirming(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirming === "delete" ? "destructive" : "default"}
              disabled={isPending || !confirming}
              onClick={() => {
                const formData = new FormData();
                formData.set("listingId", listingId);
                formData.set("action", confirming ?? "");
                startTransition(async () => {
                  await listingLifecycleAction(formData);
                  setConfirming(null);
                });
              }}
            >
              {isPending ? "Applying..." : activeLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
