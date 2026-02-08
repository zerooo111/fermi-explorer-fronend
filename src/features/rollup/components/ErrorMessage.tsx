import { Alert, AlertDescription } from "@/shared/components/ui"

interface ErrorMessageProps {
	message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
	return (
		<Alert variant="error">
			<AlertDescription className="font-mono">
				{message}
			</AlertDescription>
		</Alert>
	);
}

