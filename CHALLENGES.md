# Challenges and Resolutions

## 1. Dataset and script field mismatch

**What broke:** The generated dataset used `transaction_id`, while the supplied baseline and AI scripts expected `txn_id`. Running the baseline first failed with `KeyError: 'txn_id'`.

**How we got out:** We added a compatibility lookup that accepts `txn_id` and falls back to `transaction_id`. The baseline then processed all 100 records successfully.

## 2. Python environment mismatch

**What broke:** `faker` was installed through one Python environment, but the generator was run with `C:/Program Files/Python314/python.exe`, which initially could not import it.

**How we got out:** We installed the dependency into the exact interpreter used to run the scripts with `python -m pip install faker`. The generator then produced the dataset successfully.

## 3. Gemini model identifier

**What broke:** The Gemini model identifier was ambiguous in the initial configuration.

**How we got out:** We updated the model name to the fully qualified identifier `models/gemini-1.5-flash` and verified that the script compiled.

## 4. API calls are intentionally opt-in

The Gemini agent requires `GEMINI_API_KEY`. The script uses a bounded action list and a fallback escalation action when the model returns invalid JSON or an invalid action. No real payments are attempted; recovery outcomes are simulated locally.

## Lessons learned

- Validate the data contract before running downstream scripts.
- Use the same Python executable for dependency installation and execution.
- Keep model identifiers configurable when provider naming changes.
- Treat model output as untrusted: validate actions and preserve an audit trail.
