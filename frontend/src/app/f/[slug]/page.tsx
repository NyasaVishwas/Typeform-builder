import { getPublicForm } from "@/lib/api";
import { FormStatus } from "@/types";
import { FormRunner } from "@/features/runner/FormRunner";
import { FormUnavailableState } from "@/features/runner/FormUnavailableState";

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const form = await getPublicForm(slug);
    if (!form || form.status !== FormStatus.PUBLISHED) {
      return <FormUnavailableState slug={slug} />;
    }
    return <FormRunner form={form} />;
  } catch (err) {
    return <FormUnavailableState slug={slug} />;
  }
}
