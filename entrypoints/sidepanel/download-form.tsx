import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button } from '@/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/card';
import { Checkbox } from '@/ui/components/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/ui/components/field';
import { Input } from '@/ui/components/input';
import { isSupportedDownloadUrl } from '@/lib/download/download-file';
import { resolveDefaultUseCredentialsFetch } from '@/lib/download/messages';
import { requestAuthenticatedDownload } from '@/lib/download/request-download';
import type { DownloadFileResult } from '@/lib/download/types';

type DownloadFormValues = {
  url: string;
  filename: string;
  useCredentialsFetch: boolean;
};

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; downloadId: number }
  | { status: 'failure'; error: string };

/** Returns a react-intl message id so errors render in the active locale. */
function validateUrl(value: string): boolean | string {
  const url = value.trim();
  if (url.length === 0) {
    return 'download.missingUrl';
  }
  if (!isSupportedDownloadUrl(url)) {
    return 'download.invalidUrl';
  }
  return true;
}

function FormFieldError({ message }: { message?: string }) {
  const intl = useIntl();
  if (!message) {
    return null;
  }
  return <FieldError>{intl.formatMessage({ id: message })}</FieldError>;
}

async function submitDownload(values: DownloadFormValues): Promise<SubmitState> {
  const result: DownloadFileResult = await requestAuthenticatedDownload({
    url: values.url.trim(),
    filename: values.filename.trim() || undefined,
    useCredentialsFetch: values.useCredentialsFetch,
  });
  return result.ok
    ? { status: 'success', downloadId: result.downloadId }
    : { status: 'failure', error: result.error };
}

export function DownloadForm() {
  const intl = useIntl();
  const [state, setState] = useState<SubmitState>({ status: 'idle' });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DownloadFormValues>({
    defaultValues: {
      url: '',
      filename: '',
      useCredentialsFetch: resolveDefaultUseCredentialsFetch(),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setState({ status: 'submitting' });
    try {
      setState(await submitDownload(values));
    } catch (error) {
      console.error('Side panel download submit failed', error);
      setState({ status: 'failure', error: String(error) });
    }
  });

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="sidepanel.title" />
        </CardTitle>
        <CardDescription>
          <FormattedMessage id="sidepanel.description" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(event) => void onSubmit(event)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Field data-invalid={errors.url ? 'true' : undefined}>
              <FieldLabel htmlFor="download-url">
                <FormattedMessage id="sidepanel.urlLabel" />
              </FieldLabel>
              <Input
                id="download-url"
                type="url"
                placeholder={intl.formatMessage({ id: 'sidepanel.urlPlaceholder' })}
                {...register('url', { validate: validateUrl })}
              />
              <FormFieldError message={errors.url?.message as string | undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="download-filename">
                <FormattedMessage id="sidepanel.filenameLabel" />
              </FieldLabel>
              <Input
                id="download-filename"
                type="text"
                placeholder={intl.formatMessage({ id: 'sidepanel.filenamePlaceholder' })}
                {...register('filename')}
              />
            </Field>

            <Field orientation="horizontal">
              <Controller
                control={control}
                name="useCredentialsFetch"
                render={({ field }) => (
                  <Checkbox
                    id="use-credentials-fetch"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldLabel
                htmlFor="use-credentials-fetch"
                className="flex flex-col items-start gap-0.5"
              >
                <FormattedMessage id="sidepanel.useCredentialsFetchLabel" />
                <FieldDescription>
                  <FormattedMessage id="sidepanel.useCredentialsFetchDescription" />
                </FieldDescription>
              </FieldLabel>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={state.status === 'submitting'}>
            <FormattedMessage
              id={state.status === 'submitting' ? 'sidepanel.submitting' : 'sidepanel.submit'}
            />
          </Button>

          {state.status === 'success' && (
            <p className="text-sm text-muted-foreground" role="status">
              <FormattedMessage
                id="sidepanel.success"
                values={{ downloadId: state.downloadId }}
              />
            </p>
          )}
          {state.status === 'failure' && (
            <p className="text-sm text-destructive" role="alert">
              <FormattedMessage id="sidepanel.failure" values={{ error: state.error }} />
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
