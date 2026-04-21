import { render, screen, fireEvent } from '@testing-library/react';
import DiagnosisForm from '../components/visits/DiagnosisForm';

describe('DiagnosisForm', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the Description and Notes fields', () => {
    render(<DiagnosisForm onSubmit={() => {}} isLoading={false} />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/)).toBeInTheDocument();
  });

  it('renders the Add Diagnosis submit button', () => {
    render(<DiagnosisForm onSubmit={() => {}} isLoading={false} />);
    expect(screen.getByRole('button', { name: 'Add Diagnosis' })).toBeInTheDocument();
  });

  it('renders a Cancel button when onCancel is provided', () => {
    render(<DiagnosisForm onSubmit={() => {}} onCancel={() => {}} isLoading={false} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('does not render a Cancel button when onCancel is omitted', () => {
    render(<DiagnosisForm onSubmit={() => {}} isLoading={false} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it('shows a validation error when submitting with an empty description', () => {
    render(<DiagnosisForm onSubmit={() => {}} isLoading={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Diagnosis' }));
    // Message appears in both the Alert and the field feedback element
    expect(screen.getAllByText('Description is required.')).not.toHaveLength(0);
  });

  it('does not call onSubmit when description is empty', () => {
    const handleSubmit = vi.fn();
    render(<DiagnosisForm onSubmit={handleSubmit} isLoading={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Diagnosis' }));
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('clears the validation error once the user starts typing a description', () => {
    render(<DiagnosisForm onSubmit={() => {}} isLoading={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Diagnosis' }));
    expect(screen.getAllByText('Description is required.')).not.toHaveLength(0);

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Respiratory infection' },
    });
    expect(screen.queryByText('Description is required.')).not.toBeInTheDocument();
  });

  // ── Successful submission ─────────────────────────────────────────────────

  it('calls onSubmit with the correct values when the form is valid', () => {
    const handleSubmit = vi.fn();
    render(<DiagnosisForm onSubmit={handleSubmit} isLoading={false} />);

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Flu' },
    });
    fireEvent.change(screen.getByLabelText(/Notes/), {
      target: { value: 'Mild symptoms' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Diagnosis' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      description: 'Flu',
      notes: 'Mild symptoms',
    });
  });

  it('resets the form to empty after a successful submission', () => {
    render(<DiagnosisForm onSubmit={() => {}} isLoading={false} />);
    const descInput = screen.getByLabelText('Description');

    fireEvent.change(descInput, { target: { value: 'Flu' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Diagnosis' }));

    expect(descInput.value).toBe('');
  });

  // ── API error from props ──────────────────────────────────────────────────

  it('displays an API error passed via the error prop', () => {
    render(
      <DiagnosisForm onSubmit={() => {}} isLoading={false} error="Server error" />,
    );
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  it('shows "Adding…" and disables the button while isLoading is true', () => {
    render(<DiagnosisForm onSubmit={() => {}} isLoading={true} />);
    const btn = screen.getByRole('button', { name: 'Adding…' });
    expect(btn).toBeDisabled();
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <DiagnosisForm onSubmit={() => {}} onCancel={handleCancel} isLoading={false} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleCancel).toHaveBeenCalledOnce();
  });
});
