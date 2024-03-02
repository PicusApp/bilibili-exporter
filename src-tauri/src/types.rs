pub struct Stat(pub std::fs::Metadata);

impl serde::Serialize for Stat {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let metadata = &self.0;
        let mut state = serializer.serialize_struct("Metadata", 6)?;
        state.serialize_field("is_dir", &metadata.is_dir())?;
        state.end()
    }
}

#[derive(serde::Serialize)]
pub struct InvokeResult<T> {
    error: Option<String>,
    data: Option<T>,
}

impl<T, U> From<Result<T, U>> for InvokeResult<T>
where
    U: std::fmt::Display,
{
    fn from(r: Result<T, U>) -> InvokeResult<T> {
        match r {
            Ok(s) => InvokeResult {
                error: None,
                data: Some(s),
            },
            Err(ex) => InvokeResult {
                error: Some(format!("{}", ex)),
                data: None,
            },
        }
    }
}
