import React from "react";
import { PenTool, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { motion } from "framer-motion";

const statusConfig = {
  pending: { icon: Clock, label: "Pending", class: "bg-muted text-muted-foreground" },
  submitted: { icon: PenTool, label: "Submitted", class: "bg-accent/10 text-accent" },
  reviewed: { icon: CheckCircle2, label: "Reviewed", class: "bg-emerald-500/10 text-emerald-600" },
};

export default function EssayTopicCard({ essay, onClick, index }) {
  const status = statusConfig[essay.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        onClick={onClick}
        className="p-5 cursor-pointer hover:shadow-lg transition-all border-0 shadow-sm group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {essay.topic}
            </h3>
            {essay.score !== undefined && essay.score !== null && (
              <div className="mt-2 flex items-center gap-2">
                <div className="text-2xl font-bold text-primary">{essay.score}</div>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            )}
          </div>
          <Badge className={`${status.class} border-0 gap-1 shrink-0`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}