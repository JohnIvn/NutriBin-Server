import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

function ConfirmBox({
  mode,
  title,
  description,
  confirm,
  cancel,
  loading = false,
}) {
  const getStyles = () => {
    switch (mode?.toLowerCase()) {
      case "resolve":
        return {
          btn: "bg-green-600 hover:bg-green-700",
          icon: <CheckCircle2 className="w-10 h-10 text-green-600" />,
          bg: "bg-green-50",
        };
      case "reject":
        return {
          btn: "bg-red-600 hover:bg-red-700",
          icon: <XCircle className="w-10 h-10 text-red-600" />,
          bg: "bg-red-50",
        };
      case "accept":
        return {
          btn: "bg-blue-600 hover:bg-blue-700",
          icon: <Info className="w-10 h-10 text-blue-600" />,
          bg: "bg-blue-50",
        };
      default:
        return {
          btn: "bg-[#4F6F52] hover:bg-[#3A4335]",
          icon: <AlertTriangle className="w-10 h-10 text-[#4F6F52]" />,
          bg: "bg-emerald-50",
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="flex justify-center items-center w-screen h-screen fixed inset-0 z-[100] backdrop-blur-md bg-black/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none animate-in fade-in zoom-in duration-200">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <div className={`p-4 rounded-full ${styles.bg}`}>{styles.icon}</div>
          <CardTitle className="text-2xl font-bold text-center">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center px-6">
          <CardDescription className="text-base text-gray-600">
            {description}
          </CardDescription>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 w-full pb-8 px-8">
          <Button
            type="button"
            onClick={confirm}
            disabled={loading}
            className={`${styles.btn} text-white h-12 text-lg font-semibold w-full transition-all active:scale-95 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : mode || "Confirm"}
          </Button>

          <Button
            type="button"
            onClick={cancel}
            disabled={loading}
            variant="ghost"
            className="w-full h-12 text-gray-500 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ConfirmBox;
